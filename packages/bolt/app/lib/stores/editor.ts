import type { WebContainer } from '@webcontainer/api';
import { atom, computed, map } from 'nanostores';
import type { EditorDocument, ScrollPosition } from '../../components/editor/codemirror/CodeMirrorEditor';
import type { FileMap } from './files';

export type EditorDocuments = Record<string, EditorDocument>;

export class EditorStore {
  #webcontainer: Promise<WebContainer>;

  selectedFile = atom<string | undefined>();
  documents = map<EditorDocuments>({});

  currentDocument = computed([this.documents, this.selectedFile], (documents, selectedFile) => {
    if (!selectedFile) {
      return undefined;
    }

    return documents[selectedFile];
  });

  constructor(webcontainerPromise: Promise<WebContainer>) {
    this.#webcontainer = webcontainerPromise;
  }

  commitFileContent(_filePath: string) {
    // TODO
  }

  setDocuments(files: FileMap) {
    const previousDocuments = this.documents.value;

    this.documents.set(
      Object.fromEntries<EditorDocument>(
        Object.entries(files)
          .map(([filePath, dirent]) => {
            if (dirent === undefined || dirent.type === 'folder') {
              return undefined;
            }

            return [
              filePath,
              {
                value: dirent.content,
                commitPending: false,
                filePath,
                scroll: previousDocuments?.[filePath]?.scroll,
              },
            ] as [string, EditorDocument];
          })
          .filter(Boolean) as Array<[string, EditorDocument]>,
      ),
    );
  }

  setSelectedFile(filePath: string | undefined) {
    this.selectedFile.set(filePath);
  }

  updateScrollPosition(filePath: string, position: ScrollPosition) {
    const documents = this.documents.get();
    const documentState = documents[filePath];

    if (!documentState) {
      return;
    }

    this.documents.setKey(filePath, {
      ...documentState,
      scroll: position,
    });
  }

  updateFile(filePath: string, content: string): boolean {
    const documents = this.documents.get();
    const documentState = documents[filePath];

    if (!documentState) {
      return false;
    }

    const currentContent = documentState.value;
    const contentChanged = currentContent !== content;

    if (contentChanged) {
      this.documents.setKey(filePath, {
        ...documentState,
        previousValue: !documentState.commitPending ? currentContent : documentState.previousValue,
        commitPending: documentState.previousValue ? documentState.previousValue !== content : true,
        value: content,
      });
    }

    return contentChanged;
  }
}
