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



export class BoltShell {
  #initialized: (() => void) | undefined
  #readyPromise: Promise<void>
  #webcontainer: WebContainer | undefined
  #terminal: ITerminal | undefined
  #process: WebContainerProcess | undefined
  executionState = atom<{ sessionId: string, active: boolean, executionPrms?: Promise<any> } | undefined>()
  #outputStream: ReadableStreamDefaultReader<string> | undefined
  #shellInputStream: WritableStreamDefaultWriter<string> | undefined
  constructor() {
    this.#readyPromise = new Promise((resolve) => {
      this.#initialized = resolve
    })
  }
  ready() {
    return this.#readyPromise;
  }
  async init(webcontainer: WebContainer, terminal: ITerminal) {
    this.#webcontainer = webcontainer
    this.#terminal = terminal
    let callback = (data: string) => {
      console.log(data)
    }
    let { process, output } = await this.newBoltShellProcess(webcontainer, terminal)
    this.#process = process
    this.#outputStream = output.getReader()
    await this.waitTillOscCode('interactive')
    this.#initialized?.()
  }
  get terminal() {
    return this.#terminal
  }
  get process() {
    return this.#process
  }
  async executeCommand(sessionId: string, command: string) {
    if (!this.process || !this.terminal) {
      return
    }
    let state = this.executionState.get()

    //interrupt the current execution
    // this.#shellInputStream?.write('\x03');
    this.terminal.input('\x03');
    if (state && state.executionPrms) {
      await state.executionPrms
    }
    //start a new execution
    this.terminal.input(command.trim() + '\n');

    //wait for the execution to finish
    let executionPrms = this.getCurrentExecutionResult()
    this.executionState.set({ sessionId, active: true, executionPrms })

    let resp = await executionPrms
    this.executionState.set({ sessionId, active: false })
    return resp

  }
  async newBoltShellProcess(webcontainer: WebContainer, terminal: ITerminal) {
    const args: string[] = [];

    // we spawn a JSH process with a fallback cols and rows in case the process is not attached yet to a visible terminal
    const process = await webcontainer.spawn('/bin/jsh', ['--osc', ...args], {
      terminal: {
        cols: terminal.cols ?? 80,
        rows: terminal.rows ?? 15,
      },
    });

    const input = process.input.getWriter();
    this.#shellInputStream = input;
    const [internalOutput, terminalOutput] = process.output.tee();

    const jshReady = withResolvers<void>();

    let isInteractive = false;
    terminalOutput.pipeTo(
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

    return { process, output: internalOutput };
  }
  async getCurrentExecutionResult() {
    let { output, exitCode } = await this.waitTillOscCode('exit')
    return { output, exitCode };
  }
  async waitTillOscCode(waitCode: string) {
    let fullOutput = '';
    let exitCode: number = 0;
    if (!this.#outputStream) return { output: fullOutput, exitCode };
    let tappedStream = this.#outputStream

    while (true) {
      const { value, done } = await tappedStream.read();
      if (done) break;
      const text = value || '';
      fullOutput += text;

      // Check if command completion signal with exit code
      const [, osc, , pid, code] = text.match(/\x1b\]654;([^\x07=]+)=?((-?\d+):(\d+))?\x07/) || [];
      if (osc === 'exit') {
        exitCode = parseInt(code, 10);
      }
      if (osc === waitCode) {
        break;
      }
    }
    return { output: fullOutput, exitCode };
  }
}
export function newBoltShellProcess() {
  return new BoltShell();
}
