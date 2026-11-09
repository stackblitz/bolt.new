import { atom, type WritableAtom } from 'nanostores';
import type { ITerminal } from '~/types/terminal';
import { executeDaytonaCommand, ensureDaytonaSession, remotePreviewStore } from '~/lib/daytona.client';
import { coloredText } from '~/utils/terminal';

export class TerminalStore {
  showTerminal: WritableAtom<boolean> = import.meta.hot?.data.showTerminal ?? atom(false);

  constructor() {
    if (import.meta.hot) {
      import.meta.hot.data.showTerminal = this.showTerminal;
    }
  }

  toggleTerminal(value?: boolean) {
    this.showTerminal.set(value !== undefined ? value : !this.showTerminal.get());
  }

  async attachTerminal(terminal: ITerminal) {
    terminal.reset();
    terminal.write(coloredText.green('BeamCore · Daytona remote terminal\r\n'));
    terminal.write('Connecting to your remote workspace...\r\n');

    try {
      await ensureDaytonaSession();
      terminal.write(coloredText.green('Connected to Daytona sandbox.\r\n'));
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      terminal.write(coloredText.red('Daytona connection failed: ' + detail + '\r\n'));
      return;
    }

    let commandBuffer = '';
    let running = false;
    const writePrompt = () => terminal.write('\r\n$ ');

    writePrompt();

    terminal.onData((data) => {
      if (data === '\u0003') {
        commandBuffer = '';
        terminal.write('^C');
        writePrompt();
        return;
      }

      if (data === '\r' || data === '\n') {
        const command = commandBuffer.trim();
        commandBuffer = '';
        terminal.write('\r\n');

        if (!command) {
          writePrompt();
          return;
        }

        if (command === 'clear') {
          terminal.reset();
          writePrompt();
          return;
        }

        if (running) {
          terminal.write(coloredText.yellow('A command is already running.\r\n'));
          writePrompt();
          return;
        }

        running = true;

        void executeDaytonaCommand(command)
          .then((result) => {
            if (result.output) {
              terminal.write(result.output.replace(/\r?\n/g, '\r\n'));
              if (!result.output.endsWith('\n')) {
                terminal.write('\r\n');
              }
            }

            if (result.preview) {
              remotePreviewStore.set(result.preview);
              terminal.write(coloredText.green('Live Preview: ' + result.preview.baseUrl + '\r\n'));
            }
          })
          .catch((error) => {
            const detail = error instanceof Error ? error.message : String(error);
            terminal.write(coloredText.red(detail + '\r\n'));
          })
          .finally(() => {
            running = false;
            writePrompt();
          });

        return;
      }

      if (data === '\u007f' || data === '\b') {
        if (commandBuffer.length > 0) {
          commandBuffer = commandBuffer.slice(0, -1);
          terminal.write('\b \b');
        }
        return;
      }

      if (data.length === 1 && data >= ' ' && data !== '\u007f') {
        commandBuffer += data;
        terminal.write(data);
      }
    });
  }

  onTerminalResize(_cols: number, _rows: number) {
    // Daytona commands do not require terminal geometry.
  }
}
