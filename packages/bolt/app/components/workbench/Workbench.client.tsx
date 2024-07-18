import { useStore } from '@nanostores/react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { memo, useCallback, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { workbenchStore } from '../../lib/stores/workbench';
import { cubicEasingFn } from '../../utils/easings';
import { renderLogger } from '../../utils/logger';
import type {
  OnChangeCallback as OnEditorChange,
  OnScrollCallback as OnEditorScroll,
} from '../editor/codemirror/CodeMirrorEditor';
import { IconButton } from '../ui/IconButton';
import { EditorPanel } from './EditorPanel';
import { Preview } from './Preview';

interface WorkspaceProps {
  chatStarted?: boolean;
  isStreaming?: boolean;
}

const workbenchVariants = {
  closed: {
    width: 0,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    width: '100%',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

export const Workbench = memo(({ chatStarted, isStreaming }: WorkspaceProps) => {
  renderLogger.trace('Workbench');

  const showWorkbench = useStore(workbenchStore.showWorkbench);
  const selectedFile = useStore(workbenchStore.selectedFile);
  const currentDocument = useStore(workbenchStore.currentDocument);

  const files = useStore(workbenchStore.files);

  useEffect(() => {
    workbenchStore.setDocuments(files);
  }, [files]);

  const onEditorChange = useCallback<OnEditorChange>((update) => {
    workbenchStore.setCurrentDocumentContent(update.content);
  }, []);

  const onEditorScroll = useCallback<OnEditorScroll>((position) => {
    workbenchStore.setCurrentDocumentScrollPosition(position);
  }, []);

  const onFileSelect = useCallback((filePath: string | undefined) => {
    workbenchStore.setSelectedFile(filePath);
  }, []);

  return (
    chatStarted && (
      <AnimatePresence>
        {showWorkbench && (
          <motion.div initial="closed" animate="open" exit="closed" variants={workbenchVariants}>
            <div className="fixed top-[calc(var(--header-height)+1.5rem)] bottom-[calc(1.5rem-1px)] w-[50vw] mr-4 z-0">
              <div className="flex flex-col bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden absolute inset-0 right-8">
                <div className="px-3 py-2 border-b border-gray-200">
                  <IconButton
                    icon="i-ph:x-circle"
                    className="ml-auto"
                    size="xxl"
                    onClick={() => {
                      workbenchStore.showWorkbench.set(false);
                    }}
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <PanelGroup direction="vertical">
                    <Panel defaultSize={50} minSize={20}>
                      <EditorPanel
                        editorDocument={currentDocument}
                        isStreaming={isStreaming}
                        selectedFile={selectedFile}
                        files={files}
                        onFileSelect={onFileSelect}
                        onEditorScroll={onEditorScroll}
                        onEditorChange={onEditorChange}
                      />
                    </Panel>
                    <PanelResizeHandle />
                    <Panel defaultSize={50} minSize={20}>
                      <Preview />
                    </Panel>
                  </PanelGroup>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  );
});
