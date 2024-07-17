import { WebContainer } from '@webcontainer/api';
import * as nodePath from 'node:path';
import { createScopedLogger } from '../../utils/logger';
import type { ActionCallbackData } from './message-parser';

const logger = createScopedLogger('ActionRunner');

export class ActionRunner {
  #webcontainer: Promise<WebContainer>;

  constructor(webcontainerPromise: Promise<WebContainer>) {
    this.#webcontainer = webcontainerPromise;
  }

  async runAction({ action }: ActionCallbackData, abortSignal?: AbortSignal) {
    logger.trace('Running action', action);

    const { content } = action;

    const webcontainer = await this.#webcontainer;

    switch (action.type) {
      case 'file': {
        let folder = nodePath.dirname(action.filePath);

        // remove trailing slashes
        folder = folder.replace(/\/$/g, '');

        if (folder !== '.') {
          try {
            await webcontainer.fs.mkdir(folder, { recursive: true });
            logger.debug('Created folder', folder);
          } catch (error) {
            logger.error('Failed to create folder\n', error);
          }
        }

        try {
          await webcontainer.fs.writeFile(action.filePath, content);
          logger.debug(`File written ${action.filePath}`);
        } catch (error) {
          logger.error('Failed to write file\n', error);
        }

        break;
      }
      case 'shell': {
        const process = await webcontainer.spawn('jsh', ['-c', content]);

        abortSignal?.addEventListener('abort', () => {
          process.kill();
        });

        process.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log(data);
            },
          }),
        );

        const exitCode = await process.exit;

        logger.debug(`Process terminated with code ${exitCode}`);
      }
    }
  }
}
