import { atom, map, type MapStore, type WritableAtom } from 'nanostores';
import type { BoltAction } from '../../types/actions';
import { unreachable } from '../../utils/unreachable';
import { ActionRunner } from '../runtime/action-runner';
import type { ActionCallbackData, ArtifactCallbackData } from '../runtime/message-parser';
import { webcontainer } from '../webcontainer';
import { chatStore } from './chat';
import { PreviewsStore } from './previews';

const MIN_SPINNER_TIME = 200;

export type BaseActionState = BoltAction & {
  status: 'running' | 'complete' | 'pending' | 'aborted';
  executing: boolean;
  abort?: () => void;
};

export type FailedActionState = BoltAction &
  Omit<BaseActionState, 'status'> & {
    status: 'failed';
    error: string;
  };

export type ActionState = BaseActionState | FailedActionState;

type BaseActionUpdate = Partial<Pick<BaseActionState, 'status' | 'executing' | 'abort'>>;

export type ActionStateUpdate =
  | BaseActionUpdate
  | (Omit<BaseActionUpdate, 'status'> & { status: 'failed'; error: string });

export interface ArtifactState {
  title: string;
  closed: boolean;
  currentActionPromise: Promise<void>;
  actions: MapStore<Record<string, ActionState>>;
}

type Artifacts = MapStore<Record<string, ArtifactState>>;

export class WorkbenchStore {
  #actionRunner = new ActionRunner(webcontainer);
  #previewsStore = new PreviewsStore(webcontainer);

  artifacts: Artifacts = import.meta.hot?.data.artifacts ?? map({});

  showWorkbench: WritableAtom<boolean> = import.meta.hot?.data.showWorkbench ?? atom(false);

  get previews() {
    return this.#previewsStore.previews;
  }

  setShowWorkbench(show: boolean) {
    this.showWorkbench.set(show);
  }

  abortAllActions() {
    for (const [, artifact] of Object.entries(this.artifacts.get())) {
      for (const [, action] of Object.entries(artifact.actions.get())) {
        if (action.status === 'running') {
          action.abort?.();
        }
      }
    }
  }

  addArtifact({ id, messageId, title }: ArtifactCallbackData) {
    const artifacts = this.artifacts.get();
    const artifactKey = getArtifactKey(id, messageId);
    const artifact = artifacts[artifactKey];

    if (artifact) {
      return;
    }

    this.artifacts.setKey(artifactKey, {
      title,
      closed: false,
      actions: map({}),
      currentActionPromise: Promise.resolve(),
    });
  }

  updateArtifact({ id, messageId }: ArtifactCallbackData, state: Partial<ArtifactState>) {
    const artifacts = this.artifacts.get();
    const key = getArtifactKey(id, messageId);
    const artifact = artifacts[key];

    if (!artifact) {
      return;
    }

    this.artifacts.setKey(key, { ...artifact, ...state });
  }

  async addAction(data: ActionCallbackData) {
    const { artifactId, messageId, actionId } = data;

    const artifacts = this.artifacts.get();
    const key = getArtifactKey(artifactId, messageId);
    const artifact = artifacts[key];

    if (!artifact) {
      unreachable('Artifact not found');
    }

    const actions = artifact.actions.get();
    const action = actions[actionId];

    if (action) {
      return;
    }

    artifact.actions.setKey(actionId, { ...data.action, status: 'pending', executing: false });

    artifact.currentActionPromise.then(() => {
      if (chatStore.get().aborted) {
        return;
      }

      this.#updateAction(key, actionId, { status: 'running' });
    });
  }

  async runAction(data: ActionCallbackData) {
    const { artifactId, messageId, actionId } = data;

    const artifacts = this.artifacts.get();
    const key = getArtifactKey(artifactId, messageId);
    const artifact = artifacts[key];

    if (!artifact) {
      unreachable('Artifact not found');
    }

    const actions = artifact.actions.get();
    const action = actions[actionId];

    if (!action) {
      unreachable('Expected action to exist');
    }

    if (action.executing || action.status === 'complete' || action.status === 'failed' || action.status === 'aborted') {
      return;
    }

    artifact.currentActionPromise = artifact.currentActionPromise.then(async () => {
      if (chatStore.get().aborted) {
        return;
      }

      const abortController = new AbortController();

      this.#updateAction(key, actionId, {
        status: 'running',
        executing: true,
        abort: () => {
          abortController.abort();
          this.#updateAction(key, actionId, { status: 'aborted' });
        },
      });

      try {
        await Promise.all([
          this.#actionRunner.runAction(data, abortController.signal),
          new Promise((resolve) => setTimeout(resolve, MIN_SPINNER_TIME)),
        ]);

        if (!abortController.signal.aborted) {
          this.#updateAction(key, actionId, { status: 'complete' });
        }
      } catch (error) {
        this.#updateAction(key, actionId, { status: 'failed', error: 'Action failed' });

        throw error;
      } finally {
        this.#updateAction(key, actionId, { executing: false });
      }
    });
  }

  #updateAction(artifactId: string, actionId: string, newState: ActionStateUpdate) {
    const artifacts = this.artifacts.get();
    const artifact = artifacts[artifactId];

    if (!artifact) {
      return;
    }

    const actions = artifact.actions.get();

    artifact.actions.setKey(actionId, { ...actions[actionId], ...newState });
  }
}

export function getArtifactKey(artifactId: string, messageId: string) {
  return `${artifactId}_${messageId}`;
}

export const workbenchStore = new WorkbenchStore();

if (import.meta.hot) {
  import.meta.hot.data.artifacts = workbenchStore.artifacts;
  import.meta.hot.data.showWorkbench = workbenchStore.showWorkbench;
}
