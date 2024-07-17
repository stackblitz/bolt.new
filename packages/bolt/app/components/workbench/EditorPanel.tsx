import { useStore } from '@nanostores/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { themeStore } from '../../lib/stores/theme';
import CodeMirrorEditor from '../editor/codemirror/CodeMirrorEditor';
import { FileTreePanel } from './FileTreePanel';

export function EditorPanel() {
  const theme = useStore(themeStore);

  return (
    <PanelGroup direction="horizontal">
      <Panel defaultSize={30} minSize={20} collapsible={false}>
        <FileTreePanel />
      </Panel>
      <PanelResizeHandle />
      <Panel defaultSize={70} minSize={20}>
        <CodeMirrorEditor theme={theme} settings={{ tabSize: 2 }} />
      </Panel>
    </PanelGroup>
  );
}
