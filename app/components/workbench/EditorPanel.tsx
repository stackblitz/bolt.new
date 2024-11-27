import { useStore } from '@nanostores/react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from 'react-resizable-panels';
import {
  CodeMirrorEditor,
  type EditorDocument,
  type EditorSettings,
  type OnChangeCallback as OnEditorChange,
  type OnSaveCallback as OnEditorSave,
  type OnScrollCallback as OnEditorScroll,
} from '~/components/editor/codemirror/CodeMirrorEditor';
import { IconButton } from '~/components/ui/IconButton';
import { PanelHeader } from '~/components/ui/PanelHeader';
import { PanelHeaderButton } from '~/components/ui/PanelHeaderButton';
import { shortcutEventEmitter } from '~/lib/hooks';
import type { FileMap } from '~/lib/stores/files';
import { themeStore } from '~/lib/stores/theme';
import { workbenchStore } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { WORK_DIR } from '~/utils/constants';
import { renderLogger } from '~/utils/logger';
import { isMobile } from '~/utils/mobile';
import { FileBreadcrumb } from './FileBreadcrumb';
import { FileTree } from './FileTree';
import { Terminal, type TerminalRef } from './terminal/Terminal';

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

const MAX_TERMINALS = 3;
const DEFAULT_TERMINAL_SIZE = 25;
const COLLAPSED_TERMINAL_SIZE = 35;

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
    const { showTerminal } = useStore(workbenchStore.store);

    const terminalRefs = useRef<Array<TerminalRef | null>>([]);
    const terminalPanelRef = useRef<ImperativePanelHandle>(null);
    const terminalToggledByShortcut = useRef(false);

    const [activeTerminal, setActiveTerminal] = useState(0);
    const [terminalCount, setTerminalCount] = useState(1);

    const activeFileSegments = useMemo(() => {
      if (!editorDocument) {
        return undefined;
      }

      return editorDocument.filePath.split('/');
    }, [editorDocument]);

    const activeFileUnsaved = useMemo(() => {
      return editorDocument !== undefined && unsavedFiles?.has(editorDocument.filePath);
    }, [editorDocument, unsavedFiles]);

    useEffect(() => {
      const unsubscribeFromEventEmitter = shortcutEventEmitter.on('toggleTerminal', () => {
        terminalToggledByShortcut.current = true;
      });

      const unsubscribeFromThemeStore = themeStore.subscribe(() => {
        for (const ref of Object.values(terminalRefs.current)) {
          ref?.reloadStyles();
        }
      });

      return () => {
        unsubscribeFromEventEmitter();
        unsubscribeFromThemeStore();
      };
    }, []);

    useEffect(() => {
      const { current: terminal } = terminalPanelRef;

      if (!terminal) {
        return;
      }

      terminal.resize(showTerminal ? DEFAULT_TERMINAL_SIZE : COLLAPSED_TERMINAL_SIZE);
      terminalToggledByShortcut.current = false;
    }, [showTerminal]);

    const addTerminal = () => {
      if (terminalCount < MAX_TERMINALS) {
        setTerminalCount(terminalCount + 1);
        setActiveTerminal(terminalCount);
      }
    };

    return (
      <div
        className={classNames('flex flex-col h-full overflow-hidden', {
          'h-[calc(100%-35px)]': !showTerminal,
          'h-[75%]': showTerminal,
        })}
      >
        <div style={{ height: 'calc(100% - var(--panel-header-height))' }} className="flex-1 overflow-hidden">
          <PanelGroup direction="horizontal">
            <Panel defaultSize={20} minSize={10} collapsible>
              <div className="flex flex-col border-r border-bolt-elements-borderColor h-full">
                <PanelHeader>
                  <div className="i-ph:tree-structure-duotone shrink-0 text-bolt-elements-textSecondary" />
                  <span className="text-bolt-elements-textSecondary">Files</span>
                </PanelHeader>
                <FileTree
                  className="h-full"
                  files={files}
                  hideRoot
                  unsavedFiles={unsavedFiles}
                  rootFolder={WORK_DIR}
                  selectedFile={selectedFile}
                  onFileSelect={onFileSelect}
                />
              </div>
            </Panel>
            <PanelResizeHandle />
            <Panel className="flex flex-col" defaultSize={80} minSize={20}>
              <PanelHeader className="overflow-x-auto">
                {activeFileSegments?.length && (
                  <div className="flex items-center flex-1 text-sm">
                    <FileBreadcrumb pathSegments={activeFileSegments} files={files} onFileSelect={onFileSelect} />
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
              </PanelHeader>
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
        </div>

        <div
          className={classNames(
            'absolute bottom-0 left-0 right-0 bg-bolt-elements-terminals-background border-t border-[#2D2D2D]',
            {
              'h-[50px]': !showTerminal,
              'h-[25%]': showTerminal,
            },
          )}
        >
          <div className="h-full overflow-hidden">
            <div className="bg-bolt-elements-terminals-background h-full flex flex-col">
              <div
                className="flex items-center bg-bolt-elements-background-depth-2 border-b border-bolt-elements-borderColor gap-1.5 px-2"
                style={{
                  height: 'var(--panel-header-height)',
                  minHeight: 'var(--panel-header-height)',
                  maxHeight: 'var(--panel-header-height)',
                }}
              >
                {Array.from({ length: terminalCount }, (_, index) => {
                  const isActive = activeTerminal === index;

                  return (
                    <button
                      key={index}
                      className={classNames(
                        'flex items-center text-sm cursor-pointer gap-1.5 px-3 py-2 whitespace-nowrap rounded-full',
                        {
                          'bg-bolt-elements-terminals-buttonBackground text-bolt-elements-textPrimary': isActive,
                          'bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary hover:bg-bolt-elements-terminals-buttonBackground':
                            !isActive,
                        },
                      )}
                      onClick={() => setActiveTerminal(index)}
                    >
                      <div className="i-ph:terminal-window-duotone text-lg" />
                      Terminal {terminalCount > 1 && index + 1}
                    </button>
                  );
                })}
                {terminalCount < MAX_TERMINALS && <IconButton icon="i-ph:plus" size="md" onClick={addTerminal} />}
                <IconButton
                  className="ml-auto"
                  icon={showTerminal ? 'i-ph:caret-down' : 'i-ph:caret-up'}
                  title={showTerminal ? 'Collapse Terminal' : 'Expand Terminal'}
                  size="md"
                  onClick={() => workbenchStore.toggleTerminal(!showTerminal)}
                />
              </div>
              {Array.from({ length: terminalCount }, (_, index) => {
                const isActive = activeTerminal === index;

                return (
                  <Terminal
                    key={index}
                    className={classNames('h-full overflow-hidden', {
                      hidden: !isActive,
                    })}
                    ref={(ref) => {
                      terminalRefs.current.push(ref);
                    }}
                    onTerminalReady={(terminal) => workbenchStore.attachTerminal(terminal)}
                    onTerminalResize={(cols, rows) => workbenchStore.onTerminalResize(cols, rows)}
                    theme={theme}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
