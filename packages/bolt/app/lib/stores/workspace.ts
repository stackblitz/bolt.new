import type { WebContainer } from '@webcontainer/api';
import { atom, map, type MapStore, type WritableAtom } from 'nanostores';
import { webcontainer } from '~/lib/webcontainer';

interface WorkspaceStoreOptions {
  webcontainer: Promise<WebContainer>;
}

interface ArtifactState {
  title: string;
  closed: boolean;
  actions: any /* TODO */;
}

export class WorkspaceStore {
  #webcontainer: Promise<WebContainer>;

  artifacts: MapStore<Record<string, ArtifactState>> = import.meta.hot?.data.artifacts ?? map({});
  showWorkspace: WritableAtom<boolean> = import.meta.hot?.data.showWorkspace ?? atom(false);

  constructor({ webcontainer }: WorkspaceStoreOptions) {
    this.#webcontainer = webcontainer;
  }

  updateArtifact(id: string, state: Partial<ArtifactState>) {
    const artifacts = this.artifacts.get();
    const artifact = artifacts[id];

    this.artifacts.setKey(id, { ...artifact, ...state });
  }

  runAction() {
    // TODO
  }
}

export const workspaceStore = new WorkspaceStore({ webcontainer });

if (import.meta.hot) {
  import.meta.hot.data.artifacts = workspaceStore.artifacts;
  import.meta.hot.data.showWorkspace = workspaceStore.showWorkspace;
}
