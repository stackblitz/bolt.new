import type { WebContainer, WebContainerProcess } from '@webcontainer/api';
import type { ITerminal } from '~/types/terminal';
import { withResolvers } from './promises';
import { atom } from 'nanostores';

export async function newShellProcess(webcontainer: WebContainer, terminal: ITerminal) {
  const args: string[] = [];

  // we spawn a JSH process with a fallback cols and rows in case the process is not attached yet to a visible terminal
  const process = await webcontainer.spawn('/bin/jsh', ['--osc', ...args], {
    terminal: {
      cols: terminal.cols ?? 80,
      rows: terminal.rows ?? 15,
    },
  });

  const input = process.input.getWriter();
  const output = process.output;

  const jshReady = withResolvers<void>();

  let isInteractive = false;
  output.pipeTo(
    new WritableStream({
      write(data) {
        if (!isInteractive) {
          const [, osc] = data.match(/\x1b\]654;([^\x07]+)\x07/) || [];

          if (osc === 'interactive') {
            // wait until we see the interactive OSC
            isInteractive = true;

            jshReady.resolve();
          }
        }

        terminal.write(data);
      },
    }),
  );

  terminal.onData((data) => {
    // console.log('terminal onData', { data, isInteractive });

    if (isInteractive) {
      input.write(data);
    }
  });

  await jshReady.promise;

  return process;
}

export type ExecutionResult = { output: string; exitCode: number } | undefined;

export class BoltShell {
  #initialized: (() => void) | undefined;
  #readyPromise: Promise<void>;
  #webcontainer: WebContainer | undefined;
  #terminal: ITerminal | undefined;
  #process: WebContainerProcess | undefined;
  #isInteractive = false;
  executionState = atom<{ sessionId: string; active: boolean; executionPrms?: Promise<any> } | undefined>();
  #outputStream: ReadableStreamDefaultReader<string> | undefined;
  #shellInputStream: WritableStreamDefaultWriter<string> | undefined;
  #terminals: Set<ITerminal> = new Set();
  #outputBuffer: string[] = [];

  constructor() {
    this.#readyPromise = new Promise((resolve) => {
      this.#initialized = resolve;
    });
  }

  ready() {
    return this.#readyPromise;
  }

  async init(webcontainer: WebContainer, terminal: ITerminal) {
    console.log('BoltShell init called', {
      hasTerminal: !!this.#terminal,
      isInteractive: this.#isInteractive,
      hasProcess: !!this.#process
    });

    if (this.#terminals.has(terminal)) {
      console.log('Terminal already connected');
      return;
    }

    this.#terminals.add(terminal);

    if (this.#process) {
      console.log('Reusing existing terminal');
      
      for (const output of this.#outputBuffer) {
        terminal.write(output);
      }

      terminal.onData((data) => {
        if (this.#shellInputStream) {
          this.#shellInputStream.write(data);
          for (const term of this.#terminals) {
            if (term !== terminal) {
              term.write(data);
            }
          }
        }
      });

      return;
    }

    console.log('Creating new terminal connection');
    this.#webcontainer = webcontainer;
    this.#terminal = terminal;

    const process = await webcontainer.spawn('/bin/jsh', ['--osc', ], {
      terminal: {
        cols: terminal.cols ?? 80,
        rows: terminal.rows ?? 15,
      },
    });

    this.#process = process;
    const input = process.input.getWriter();
    this.#shellInputStream = input;

    const reader = process.output.getReader();
    this.#outputStream = reader;

    const pump = async () => {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          this.#outputBuffer.push(value);

          if (!this.#isInteractive) {
            const [, osc] = value.match(/\x1b\]654;([^\x07]+)\x07/) || [];
            if (osc === 'interactive') {
              this.#isInteractive = true;
              this.#initialized?.();
            }
          }

          for (const term of this.#terminals) {
            term.write(value);
          }
        }
      } catch (error) {
        console.error('Output stream error:', error);
      }
    };

    pump();

    terminal.onData((data) => {
      if (this.#shellInputStream) {
        this.#shellInputStream.write(data);
        for (const term of this.#terminals) {
          if (term !== terminal) {
            term.write(data);
          }
        }
      }
    });

    await this.waitTillOscCode('interactive');
    console.log('Terminal initialization complete');
  }

  get terminal() {
    return this.#terminal;
  }

  get isInitialized() {
    return this.#isInteractive;
  }

  get process() {
    return this.#process;
  }

  async executeCommand(sessionId: string, command: string): Promise<ExecutionResult> {
    if (!this.process || !this.terminal) {
      return undefined;
    }

    const state = this.executionState.get();

    if (state && state.executionPrms) {
      await state.executionPrms;
    }

    this.#shellInputStream?.write(command.trim() + '\n');

    const executionPromise = this.getCurrentExecutionResult();
    this.executionState.set({ sessionId, active: true, executionPrms: executionPromise });

    const resp = await executionPromise;
    this.executionState.set({ sessionId, active: false });

    return resp;
  }

  async getCurrentExecutionResult(): Promise<ExecutionResult> {
    const { output, exitCode } = await this.waitTillOscCode('exit');
    return { output, exitCode };
  }

  async waitTillOscCode(waitCode: string) {
    let fullOutput = '';
    let exitCode = 0;

    return new Promise<{ output: string; exitCode: number }>(resolve => {
      const checkBuffer = () => {
        for (const output of this.#outputBuffer) {
          fullOutput += output;
          const [, osc, , , code] = output.match(/\x1b\]654;([^\x07=]+)=?((-?\d+):(\d+))?\x07/) || [];

          if (osc === 'exit') {
            exitCode = parseInt(code, 10);
          }

          if (osc === waitCode) {
            resolve({ output: fullOutput, exitCode });
            return;
          }
        }
        setTimeout(checkBuffer, 100);
      };

      checkBuffer();
    });
  }

  detachTerminal(terminal: ITerminal) {
    this.#terminals.delete(terminal);
  }

  onTerminalResize(cols: number, rows: number) {
    if (this.#process) {
      this.#process.resize({ cols, rows });
    }
  }
}

export function newBoltShellProcess() {
  return new BoltShell();
}