import type { PathWatcherEvent, WebContainer } from '@webcontainer/api';
import { map, type MapStore } from 'nanostores';
import * as nodePath from 'node:path';
import { bufferWatchEvents } from '../../utils/buffer';
import { WORK_DIR } from '../../utils/constants';
import { createScopedLogger } from '../../utils/logger';

const logger = createScopedLogger('FilesStore');

const textDecoder = new TextDecoder('utf8', { fatal: true });

export interface File {
  type: 'file';
  content: string | Uint8Array;
}

export interface Folder {
  type: 'folder';
}

type Dirent = File | Folder;

export type FileMap = Record<string, Dirent | undefined>;

export class FilesStore {
  #webcontainer: Promise<WebContainer>;

  /**
   * Tracks the number of files without folders.
   */
  #size = 0;

  files: MapStore<FileMap> = import.meta.hot?.data.files ?? map({});

  get filesCount() {
    return this.#size;
  }

  constructor(webcontainerPromise: Promise<WebContainer>) {
    this.#webcontainer = webcontainerPromise;

    if (import.meta.hot) {
      import.meta.hot.data.files = this.files;
    }

    this.#init();
  }

  getFile(filePath: string) {
    const dirent = this.files.get()[filePath];

    if (dirent?.type !== 'file') {
      return undefined;
    }

    return dirent;
  }

  async saveFile(filePath: string, content: string | Uint8Array) {
    const webcontainer = await this.#webcontainer;

    try {
      const relativePath = nodePath.relative(webcontainer.workdir, filePath);

      if (!relativePath) {
        throw new Error(`EINVAL: invalid file path, write '${relativePath}'`);
      }

      await webcontainer.fs.writeFile(relativePath, content);

      this.files.setKey(filePath, { type: 'file', content });

      logger.info('File updated');
    } catch (error) {
      logger.error('Failed to update file content\n\n', error);

      throw error;
    }
  }

  async #init() {
    const webcontainer = await this.#webcontainer;

    webcontainer.watchPaths(
      { include: [`${WORK_DIR}/**`], exclude: ['**/node_modules', '.git'], includeContent: true },
      bufferWatchEvents(100, this.#processEventBuffer.bind(this)),
    );
  }

  #processEventBuffer(events: Array<[events: PathWatcherEvent[]]>) {
    const watchEvents = events.flat(2);

    for (const { type, path, buffer } of watchEvents) {
      // remove any trailing slashes
      const sanitizedPath = path.replace(/\/+$/g, '');

      switch (type) {
        case 'add_dir': {
          // we intentionally add a trailing slash so we can distinguish files from folders in the file tree
          this.files.setKey(sanitizedPath, { type: 'folder' });
          break;
        }
        case 'remove_dir': {
          this.files.setKey(sanitizedPath, undefined);

          for (const [direntPath] of Object.entries(this.files)) {
            if (direntPath.startsWith(sanitizedPath)) {
              this.files.setKey(direntPath, undefined);
            }
          }

          break;
        }
        case 'add_file':
        case 'change': {
          if (type === 'add_file') {
            this.#size++;
          }

          this.files.setKey(sanitizedPath, { type: 'file', content: this.#decodeFileContent(buffer) });

          break;
        }
        case 'remove_file': {
          this.#size--;
          this.files.setKey(sanitizedPath, undefined);
          break;
        }
        case 'update_directory': {
          // we don't care about these events
          break;
        }
      }
    }
  }

  #decodeFileContent(buffer?: Uint8Array) {
    if (!buffer || buffer.byteLength === 0) {
      return '';
    }

    try {
      return textDecoder.decode(buffer);
    } catch (error) {
      console.log(error);
      return '';
    }
  }
}
