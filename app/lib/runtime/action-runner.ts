import { WebContainer } from '@webcontainer/api';
import { map, type MapStore } from 'nanostores';
import * as nodePath from 'node:path';
import type { BoltAction } from '~/types/actions';
import { createScopedLogger } from '~/utils/logger';
import { WORK_DIR } from '~/utils/constants';
import { executeDaytonaCommand, remotePreviewStore, syncDaytonaFiles, writeDaytonaFile, type DaytonaSyncFile } from '~/lib/daytona.client';
import type { FileMap } from '~/lib/stores/files';
import { unreachable } from '~/utils/unreachable';
import type { ActionCallbackData } from './message-parser';

const logger = createScopedLogger('ActionRunner');

export type ActionStatus = 'pending' | 'running' | 'complete' | 'aborted' | 'failed';

export type BaseActionState = BoltAction & {
  status: Exclude<ActionStatus, 'failed'>;
  abort: () => void;
  executed: boolean;
  abortSignal: AbortSignal;
  output?: string;
};

export type FailedActionState = BoltAction &
  Omit<BaseActionState, 'status'> & {
    status: Extract<ActionStatus, 'failed'>;
    error: string;
  };

export type ActionState = BaseActionState | FailedActionState;

type BaseActionUpdate = Partial<Pick<BaseActionState, 'status' | 'abort' | 'executed' | 'output'>>;

export type ActionStateUpdate =
  | BaseActionUpdate
  | (Omit<BaseActionUpdate, 'status'> & { status: 'failed'; error: string });

type ActionsMap = MapStore<Record<string, ActionState>>;

export class ActionRunner {
  #webcontainer: Promise<WebContainer>;
  #getFiles: () => FileMap;
  #webcontainerReady = false;
  #pendingFileMirrors: Promise<void> = Promise.resolve();
  #currentExecutionPromise: Promise<void> = Promise.resolve();

  actions: ActionsMap = map({});

  constructor(webcontainerPromise: Promise<WebContainer>, getFiles: () => FileMap = () => ({})) {
    this.#webcontainer = webcontainerPromise;
    this.#getFiles = getFiles;

    void this.#webcontainer.then(
      () => {
        this.#webcontainerReady = true;
      },
      (error) => {
        this.#webcontainerReady = false;
        logger.warn('Browser WebContainer is unavailable; Daytona remains the primary runtime.', error);
      },
    );
  }

  addAction(data: ActionCallbackData) {
    const { actionId } = data;
    const actions = this.actions.get();
    const action = actions[actionId];

    if (action) {
      return;
    }

    const abortController = new AbortController();

    this.actions.setKey(actionId, {
      ...data.action,
      status: 'pending',
      executed: false,
      abort: () => {
        abortController.abort();
        this.#updateAction(actionId, { status: 'aborted' });
      },
      abortSignal: abortController.signal,
    });

    this.#currentExecutionPromise.then(() => {
      this.#updateAction(actionId, { status: 'running' });
    });
  }

  async runAction(data: ActionCallbackData) {
    const { actionId } = data;
    const action = this.actions.get()[actionId];

    if (!action) {
      unreachable('Action ' + actionId + ' not found');
    }

    if (action.executed) {
      return;
    }

    this.#updateAction(actionId, { ...action, ...data.action, executed: true });

    this.#currentExecutionPromise = this.#currentExecutionPromise
      .then(() => this.#executeAction(actionId))
      .catch((error) => {
        console.error('[BeamCore] Action execution failed:', error);
      });
  }

  async #executeAction(actionId: string) {
    const action = this.actions.get()[actionId];

    this.#updateAction(actionId, { status: 'running' });

    try {
      switch (action.type) {
        case 'shell': {
          const result = await this.#runShellAction(action);
          this.#updateAction(actionId, { output: result.output });
          break;
        }
        case 'file': {
          await this.#runFileAction(action);
          break;
        }
      }

      this.#updateAction(actionId, { status: action.abortSignal.aborted ? 'aborted' : 'complete' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.#updateAction(actionId, { status: 'failed', error: message });
      throw error;
    }
  }

  async #runShellAction(action: ActionState) {
    if (action.type !== 'shell') {
      unreachable('Expected shell action');
    }

    if (action.abortSignal.aborted) {
      throw new Error('Command was cancelled before execution.');
    }

    const canSyncBrowserFiles = this.#webcontainerReady;

    if (canSyncBrowserFiles) {
      await this.#pendingFileMirrors;
    }

    const shouldSyncBrowserFiles = canSyncBrowserFiles && this.#webcontainerReady;
    const files: DaytonaSyncFile[] = [];
    let totalBytes = 0;

    for (const [absolutePath, entry] of Object.entries(this.#getFiles())) {
      if (entry?.type !== 'file' || entry.isBinary) {
        continue;
      }

      const relativePath = nodePath.posix.relative(WORK_DIR, absolutePath.replace(/\\/g, '/'));

      if (
        !relativePath ||
        relativePath === '.' ||
        relativePath === '..' ||
        relativePath.startsWith('../') ||
        /(^|\/)(?:node_modules|\.git|\.cache|dist|build)(\/|$)/.test(relativePath)
      ) {
        continue;
      }

      totalBytes += new TextEncoder().encode(entry.content).byteLength;

      if (files.length >= 300 || totalBytes > 2_000_000) {
        break;
      }

      files.push({ path: relativePath, content: entry.content });
    }

    if (shouldSyncBrowserFiles && files.length > 0) {
      await syncDaytonaFiles(files);
    }

    const result = await executeDaytonaCommand(action.content);

    if (result.preview) {
      remotePreviewStore.set(result.preview);
    }

    const output = result.output || '';

    if (typeof result.exitCode === 'number' && result.exitCode !== 0) {
      throw new Error('Daytona command failed with exit code ' + result.exitCode + '.\n' + output);
    }

    logger.info('Command completed in Daytona sandbox.');

    return { output };
  }

  async #runFileAction(action: ActionState) {
    if (action.type !== 'file') {
      unreachable('Expected file action');
    }

    const requestedPath = action.filePath.replace(/\\/g, '/');
    const safePath = nodePath.posix.normalize(requestedPath);

    if (
      !requestedPath ||
      nodePath.posix.isAbsolute(requestedPath) ||
      safePath === '.' ||
      safePath === '..' ||
      safePath.startsWith('../')
    ) {
      throw new Error('Refusing to write outside the project directory: ' + action.filePath);
    }

    // Persist the file in the primary remote runtime first. A browser runtime
    // startup failure must never prevent Daytona from receiving project files.
    await writeDaytonaFile(safePath, action.content);

    // Keep the WebContainer filesystem as a best-effort editor mirror only.
    // Do not block remote shell actions or Preview while the browser runtime boots.
    const mirror = this.#webcontainer
      .then(async (webcontainer) => {
        const folder = nodePath.posix.dirname(safePath);

        if (folder !== '.') {
          await webcontainer.fs.mkdir(folder, { recursive: true });
          logger.debug('Created local folder', folder);
        }

        await webcontainer.fs.writeFile(safePath, action.content);
        this.#webcontainerReady = true;
        logger.debug('File mirrored into the browser editor: ' + safePath);
      })
      .catch((error) => {
        this.#webcontainerReady = false;
        logger.warn('Browser file mirror unavailable; the file was saved in Daytona: ' + safePath, error);
      });

    this.#pendingFileMirrors = Promise.all([this.#pendingFileMirrors, mirror]).then(() => undefined);
    logger.debug('File saved to Daytona sandbox: ' + safePath);
  }

  #updateAction(id: string, newState: ActionStateUpdate) {
    const actions = this.actions.get();
    this.actions.setKey(id, { ...actions[id], ...newState });
  }
}
