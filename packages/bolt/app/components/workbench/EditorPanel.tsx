import { useStore } from '@nanostores/react';
import { memo, useMemo } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import type { FileMap } from '../../lib/stores/files';
import { themeStore } from '../../lib/stores/theme';
import { renderLogger } from '../../utils/logger';
import { isMobile } from '../../utils/mobile';
import {
  CodeMirrorEditor,
  type EditorDocument,
  type EditorSettings,
  type OnChangeCallback as OnEditorChange,
  type OnSaveCallback as OnEditorSave,
  type OnScrollCallback as OnEditorScroll,
} from '../editor/codemirror/CodeMirrorEditor';
import { PanelHeaderButton } from '../ui/PanelHeaderButton';
import { FileTreePanel } from './FileTreePanel';

interface EditorPanelProps {
  files?: FileMap;
  unsavedFiles?: Set<string>;
  editorDocument?: EditorDocument;
  selectedFile?: string | undefined;
  isStreaming?: boolean;
  onEditorChange?: OnEditorChange;
  onEditorScroll?: OnEditorScroll;
  onFileSelect?: (value?: string) => void;
  onFileSave?: OnEditorSave;
  onFileReset?: () => void;
}

const editorSettings: EditorSettings = { tabSize: 2 };

export const EditorPanel = memo(
  ({
    files,
    unsavedFiles,
    editorDocument,
    selectedFile,
    isStreaming,
    onFileSelect,
    onEditorChange,
    onEditorScroll,
    onFileSave,
    onFileReset,
  }: EditorPanelProps) => {
    renderLogger.trace('EditorPanel');

    const theme = useStore(themeStore);

    const activeFile = useMemo(() => {
      if (!editorDocument) {
        return '';
      }

      return editorDocument.filePath.split('/').at(-1);
    }, [editorDocument]);

    const activeFileUnsaved = useMemo(() => {
      return editorDocument !== undefined && unsavedFiles?.has(editorDocument.filePath);
    }, [editorDocument, unsavedFiles]);

    return (
      <PanelGroup direction="horizontal">
        <Panel className="flex flex-col" defaultSize={25} minSize={10} collapsible={true}>
          <div className="border-r h-full">
            <div className="flex items-center gap-2 bg-gray-50 border-b px-4 py-1 min-h-[34px]">
              <div className="i-ph:tree-structure-duotone shrink-0" />
              Files
            </div>
            <FileTreePanel
              files={files}
              unsavedFiles={unsavedFiles}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
            />
          </div>
        </Panel>
        <PanelResizeHandle />
        <Panel className="flex flex-col" defaultSize={75} minSize={20}>
          <div className="flex items-center gap-2 bg-gray-50 border-b px-4 py-1 min-h-[34px] text-sm">
            {activeFile && (
              <div className="flex items-center flex-1">
                {activeFile} {isStreaming && <span className="text-xs ml-1 font-semibold">(read-only)</span>}
                {activeFileUnsaved && (
                  <div className="flex gap-1 ml-auto -mr-1.5">
                    <PanelHeaderButton onClick={onFileSave}>
                      <div className="i-ph:floppy-disk-duotone" />
                      Save
                    </PanelHeaderButton>
                    <PanelHeaderButton onClick={onFileReset}>
                      <div className="i-ph:clock-counter-clockwise-duotone" />
                      Reset
                    </PanelHeaderButton>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="h-full flex-1 overflow-hidden">
            <CodeMirrorEditor
              theme={theme}
              editable={!isStreaming && editorDocument !== undefined}
              settings={editorSettings}
              doc={editorDocument}
              autoFocusOnDocumentChange={!isMobile()}
              onScroll={onEditorScroll}
              onChange={onEditorChange}
              onSave={onFileSave}
            />
          </div>
        </Panel>
      </PanelGroup>
    );
  },
);
