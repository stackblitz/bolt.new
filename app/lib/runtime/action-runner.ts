import { WebContainer, type WebContainerProcess } from '@webcontainer/api';
import { atom, map, type MapStore } from 'nanostores';
import * as nodePath from 'node:path';
import type { BoltAction } from '~/types/actions';
import { createScopedLogger } from '~/utils/logger';
import { unreachable } from '~/utils/unreachable';
import type { ActionCallbackData } from './message-parser';
import type { ITerminal } from '~/types/terminal';
import type { BoltShell } from '~/utils/shell';

const logger = createScopedLogger('ActionRunner');

export type ActionStatus = 'pending' | 'running' | 'complete' | 'aborted' | 'failed';

export type BaseActionState = BoltAction & {
  status: Exclude<ActionStatus, 'failed'>;
  abort: () => void;
  executed: boolean;
  abortSignal: AbortSignal;
};

export type FailedActionState = BoltAction &
  Omit<BaseActionState, 'status'> & {
    status: Extract<ActionStatus, 'failed'>;
    error: string;
  };

export type ActionState = BaseActionState | FailedActionState;

type BaseActionUpdate = Partial<Pick<BaseActionState, 'status' | 'abort' | 'executed'>>;

export type ActionStateUpdate =
  | BaseActionUpdate
  | (Omit<BaseActionUpdate, 'status'> & { status: 'failed'; error: string });

type ActionsMap = MapStore<Record<string, ActionState>>;

export class ActionRunner {
  #webcontainer: Promise<WebContainer>;
  #currentExecutionPromise: Promise<void> = Promise.resolve();
  #shellTerminal: () => BoltShell;
  runnerId = atom<string>(`${Date.now()}`);
  actions: ActionsMap = map({});

  constructor(webcontainerPromise: Promise<WebContainer>, getShellTerminal: () => BoltShell) {
    this.#webcontainer = webcontainerPromise;
    this.#shellTerminal = getShellTerminal;

  }

  addAction(data: ActionCallbackData) {
    const { actionId } = data;

    const actions = this.actions.get();
    const action = actions[actionId];

    if (action) {
      // action already added
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
      unreachable(`Action ${actionId} not found`);
    }

    if (action.executed) {
      return;
    }

    this.#updateAction(actionId, { ...action, ...data.action, executed: true });

    this.#currentExecutionPromise = this.#currentExecutionPromise
      .then(() => {
        return this.#executeAction(actionId);
      })
      .catch((error) => {
        console.error('Action failed:', error);
      });
  }

  async #executeAction(actionId: string) {
    const action = this.actions.get()[actionId];

    this.#updateAction(actionId, { status: 'running' });

    try {
      switch (action.type) {
        case 'shell': {
          await this.#runShellAction(action);
          break;
        }
        case 'file': {
          await this.#runFileAction(action);
          break;
        }
        case 'start': {
          await this.#runStartAction(action);
          break;
        }
      }

      this.#updateAction(actionId, { status: action.abortSignal.aborted ? 'aborted' : 'complete' });
    } catch (error) {
      this.#updateAction(actionId, { status: 'failed', error: 'Action failed' });

      // re-throw the error to be caught in the promise chain
      throw error;
    }
  }

  async #runShellAction(action: ActionState) {
    if (action.type !== 'shell') {
      unreachable('Expected shell action');
    }
    const shell = this.#shellTerminal()
    await shell.ready()
    if (!shell || !shell.terminal || !shell.process) {
      unreachable('Shell terminal not found');
    }
    const resp = await shell.executeCommand(this.runnerId.get(), action.content)
    if (resp?.exitCode != 0) {
      throw new Error("Failed To Start Application");

    }
  }

  async #runStartAction(action: ActionState) {
    if (action.type !== 'start') {
      unreachable('Expected shell action');
    }
    if (!this.#shellTerminal) {
      unreachable('Shell terminal not found');
    }
    const shell = this.#shellTerminal()
    await shell.ready()
    if (!shell || !shell.terminal || !shell.process) {
      unreachable('Shell terminal not found');
    }
    const resp = await shell.executeCommand(this.runnerId.get(), action.content)
    if (resp?.exitCode != 0) {
      throw new Error("Failed To Start Application");

    }
  }

  async #runFileAction(action: ActionState) {
    if (action.type !== 'file') {
      unreachable('Expected file action');
    }

    const webcontainer = await this.#webcontainer;

    let folder = nodePath.dirname(action.filePath);

    // remove trailing slashes
    folder = folder.replace(/\/+$/g, '');

    if (folder !== '.') {
      try {
        await webcontainer.fs.mkdir(folder, { recursive: true });
        logger.debug('Created folder', folder);
      } catch (error) {
        logger.error('Failed to create folder\n\n', error);
      }
    }

    try {
      await webcontainer.fs.writeFile(action.filePath, action.content);
      logger.debug(`File written ${action.filePath}`);
    } catch (error) {
      logger.error('Failed to write file\n\n', error);
    }
  }
  async getCurrentExecutionResult(output: ReadableStreamDefaultReader<string>) {
    let fullOutput = '';
    let exitCode: number = 0;
    while (true) {
      const { value, done } = await output.read();
      if (done) break;
      const text = value || '';
      fullOutput += text;
      // Check if command completion signal with exit code
      const exitMatch = fullOutput.match(/\]654;exit=-?\d+:(\d+)/);
      if (exitMatch) {
        exitCode = parseInt(exitMatch[1], 10);
        break;
      }
    }
    return { output: fullOutput, exitCode };
  }

  #updateAction(id: string, newState: ActionStateUpdate) {
    const actions = this.actions.get();

    this.actions.setKey(id, { ...actions[id], ...newState });
  }
}
