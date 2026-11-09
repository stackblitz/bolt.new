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
  #daytonaUnavailableReason?: string;
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

    // Daytona is the preferred runtime. If its credentials or service are
    // unavailable, continue in the browser WebContainer instead of silently
    // leaving the generated project without a running Preview.
    if (this.#daytonaUnavailableReason) {
      logger.warn('Using WebContainer because Daytona is unavailable: ' + this.#daytonaUnavailableReason);
      return this.#runWebContainerCommand(action.content);
    }

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

    try {
      if (files.length > 0) {
        await syncDaytonaFiles(files);
      }

      const result = await executeDaytonaCommand(action.content);
      const output = result.output || '';

      if (typeof result.exitCode === 'number' && result.exitCode !== 0) {
        throw new Error('Daytona command failed with exit code ' + result.exitCode + '.\\n' + output);
      }

      if (result.preview) {
        remotePreviewStore.set(result.preview);
      }

      logger.info('Command completed in Daytona sandbox.');
      return { output };
    } catch (error) {
      if (!this.#isDaytonaUnavailable(error)) {
        throw error;
      }

      this.#daytonaUnavailableReason = error instanceof Error ? error.message : String(error);
      logger.warn('Daytona is unavailable; falling back to the browser WebContainer.', error);
      return this.#runWebContainerCommand(action.content);
    }
  }

  #isDaytonaUnavailable(error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    return /DAYTONA_API_KEY|Daytona request failed|Daytona could not complete|Failed to fetch|NetworkError|ECONN|\\b50[023]\\b|timed out/i.test(detail);
  }

  async #runWebContainerCommand(command: string) {
    const webcontainer = await this.#webcontainer;
    const isDevServer = /\\b(?:npm|pnpm|yarn|bun)\\s+(?:run\\s+)?(?:dev|start|preview)\\b/i.test(command);
    const process = await webcontainer.spawn('jsh');
    let output = '';

    const outputFinished = process.output.pipeTo(new WritableStream<string>({
      write(chunk) {
        output += chunk;
      },
    })).catch((error) => {
      logger.warn('Could not capture all WebContainer command output.', error);
    });

    let serverReadyPromise: Promise<{ port: number; url: string }> | undefined;

    if (isDevServer) {
      serverReadyPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          dispose();
          process.kill();
          reject(new Error('WebContainer started the dev command but no preview server became ready within 45 seconds.'));
        }, 45_000);

        const dispose = webcontainer.on('server-ready', (port, url) => {
          clearTimeout(timeout);
          dispose();
          resolve({ port, url });
        });
      });
    }

    const input = process.input.getWriter();

    try {
      await input.write(isDevServer ? command + '\\n' : command + '\\nexit\\n');
    } finally {
      input.releaseLock();
    }

    if (serverReadyPromise) {
      const server = await serverReadyPromise;
      logger.info('WebContainer Preview is ready on port ' + server.port + ': ' + server.url);
      return { output: (output ? output + '\\n' : '') + 'WebContainer Preview ready: ' + server.url };
    }

    const exitCode = await process.exit;
    await outputFinished;

    if (exitCode !== 0) {
      throw new Error('WebContainer command failed with exit code ' + exitCode + '.\\n' + output);
    }

    logger.info('Command completed in browser WebContainer.');
    return { output };
  }

  async #runFileAction(action: ActionState) {
    if (action.type !== 'file') {
      unreachable('Expected file action');
    }

    const requestedPath = action.filePath.replace(/\\\\/g, '/');
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

    let browserSaved = false;
    let remoteSaved = false;
    let browserError: unknown;

    // Write locally first so a missing Daytona credential never discards the
    // AI-generated file. The local editor and Preview remain usable offline.
    try {
      const webcontainer = await this.#webcontainer;
      const folder = nodePath.posix.dirname(safePath);

      if (folder !== '.') {
        await webcontainer.fs.mkdir(folder, { recursive: true });
        logger.debug('Created browser project folder', folder);
      }

      await webcontainer.fs.writeFile(safePath, action.content);
      this.#webcontainerReady = true;
      browserSaved = true;
      logger.debug('File saved to browser WebContainer: ' + safePath);
    } catch (error) {
      browserError = error;
      this.#webcontainerReady = false;
      logger.warn('Could not save the file to browser WebContainer: ' + safePath, error);
    }

    if (!this.#daytonaUnavailableReason) {
      try {
        await writeDaytonaFile(safePath, action.content);
        remoteSaved = true;
        logger.debug('File mirrored to Daytona sandbox: ' + safePath);
      } catch (error) {
        this.#daytonaUnavailableReason = error instanceof Error ? error.message : String(error);
        logger.warn('Daytona file sync is unavailable; keeping the file in WebContainer: ' + safePath, error);
      }
    }

    if (!browserSaved && !remoteSaved) {
      const browserDetail = browserError instanceof Error ? browserError.message : String(browserError || '');
      throw new Error(
        'Could not save ' + safePath + ' in either runtime. WebContainer: ' +
        (browserDetail || 'unavailable') + '. Daytona: ' +
        (this.#daytonaUnavailableReason || 'unavailable'),
      );
    }
  }

  #updateAction(id: string, newState: ActionStateUpdate) {
    const actions = this.actions.get();
    this.actions.setKey(id, { ...actions[id], ...newState });
  }
}
