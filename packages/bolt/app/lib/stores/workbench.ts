import { atom, map, type MapStore, type WritableAtom } from 'nanostores';
import type { BoltAction } from '../../types/actions';
import { unreachable } from '../../utils/unreachable';
import { ActionRunner } from '../runtime/action-runner';
import type { ActionCallbackData, ArtifactCallbackData } from '../runtime/message-parser';
import { webcontainer } from '../webcontainer';
import { PreviewsStore } from './previews';

export type RunningState = BoltAction & {
  status: 'running' | 'complete' | 'pending' | 'aborted';
  abort?: () => void;
};

export type FailedState = BoltAction & {
  status: 'failed';
  error: string;
  abort?: () => void;
};

export type ActionState = RunningState | FailedState;

export type ActionStateUpdate =
  | { status: 'running' | 'complete' | 'pending' | 'aborted'; abort?: () => void }
  | { status: 'failed'; error: string; abort?: () => void }
  | { abort?: () => void };

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

    if (action) {
      return;
    }

    artifact.actions.setKey(actionId, { ...data.action, status: 'pending' });

    artifact.currentActionPromise = artifact.currentActionPromise.then(async () => {
      try {
        let abortController: AbortController | undefined;

        if (data.action.type === 'shell') {
          abortController = new AbortController();
        }

        let aborted = false;

        this.#updateAction(key, actionId, {
          status: 'running',
          abort: () => {
            aborted = true;
            abortController?.abort();
          },
        });

        await this.#actionRunner.runAction(data, abortController?.signal);

        this.#updateAction(key, actionId, { status: aborted ? 'aborted' : 'complete' });
      } catch (error) {
        this.#updateAction(key, actionId, { status: 'failed', error: 'Action failed' });

        throw error;
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
