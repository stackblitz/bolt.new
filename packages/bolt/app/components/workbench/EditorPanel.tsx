import { useStore } from '@nanostores/react';
import { memo } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import type { FileMap } from '../../lib/stores/files';
import { themeStore } from '../../lib/stores/theme';
import { renderLogger } from '../../utils/logger';
import { isMobile } from '../../utils/mobile';
import {
  CodeMirrorEditor,
  type EditorDocument,
  type OnChangeCallback as OnEditorChange,
  type OnScrollCallback as OnEditorScroll,
} from '../editor/codemirror/CodeMirrorEditor';
import { FileTreePanel } from './FileTreePanel';

interface EditorPanelProps {
  files?: FileMap;
  editorDocument?: EditorDocument;
  selectedFile?: string | undefined;
  isStreaming?: boolean;
  onEditorChange?: OnEditorChange;
  onEditorScroll?: OnEditorScroll;
  onFileSelect?: (value?: string) => void;
}

export const EditorPanel = memo(
  ({ files, editorDocument, selectedFile, onFileSelect, onEditorChange, onEditorScroll }: EditorPanelProps) => {
    renderLogger.trace('EditorPanel');

    const theme = useStore(themeStore);

    return (
      <PanelGroup direction="horizontal">
        <Panel defaultSize={25} minSize={10} collapsible={true}>
          <FileTreePanel files={files} selectedFile={selectedFile} onFileSelect={onFileSelect} />
        </Panel>
        <PanelResizeHandle />
        <Panel defaultSize={75} minSize={20}>
          <CodeMirrorEditor
            theme={theme}
            editable={true}
            settings={{ tabSize: 2 }}
            doc={editorDocument}
            autoFocusOnDocumentChange={!isMobile()}
            onScroll={onEditorScroll}
            onChange={onEditorChange}
          />
        </Panel>
      </PanelGroup>
    );
  },
);
