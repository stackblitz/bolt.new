import { useStore } from '@nanostores/react';
import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';
import { computed } from 'nanostores';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  type OnChangeCallback as OnEditorChange,
  type OnScrollCallback as OnEditorScroll,
} from '~/components/editor/codemirror/CodeMirrorEditor';
import { IconButton } from '~/components/ui/IconButton';
import { PanelHeaderButton } from '~/components/ui/PanelHeaderButton';
import { Slider, type SliderOptions } from '~/components/ui/Slider';
import { workbenchStore, type WorkbenchViewType } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { cubicEasingFn } from '~/utils/easings';
import { renderLogger } from '~/utils/logger';
import { EditorPanel } from './EditorPanel';
import { Preview } from './Preview';
import { chatId } from '~/lib/persistence/useChatHistory';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { chatStore } from '~/lib/stores/chat';
import { Drawer, DrawerContent } from '~/components/ui/drawer';

interface WorkspaceProps {
  chatStarted?: boolean;
  isStreaming?: boolean;
}

const viewTransition = { ease: cubicEasingFn };

const sliderOptions: SliderOptions<WorkbenchViewType> = {
  left: {
    value: 'code',
    text: 'Code',
  },
  right: {
    value: 'preview',
    text: 'Preview',
  },
};

const workbenchVariants = {
  closed: {
    width: 0,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    width: 'var(--workbench-width)',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export const Workbench = memo(({ chatStarted, isStreaming }: WorkspaceProps) => {
  renderLogger.trace('Workbench');

  const isMobile = useIsMobile();
  const hasPreview = useStore(computed(workbenchStore.previews, (previews) => previews.length > 0));
  const showWorkbench = useStore(workbenchStore.showWorkbench);
  const selectedFile = useStore(workbenchStore.selectedFile);
  const currentDocument = useStore(workbenchStore.currentDocument);
  const unsavedFiles = useStore(workbenchStore.unsavedFiles);
  const files = useStore(workbenchStore.files);
  const selectedView = useStore(workbenchStore.currentView);
  const { showChat } = useStore(chatStore);

  const canHideChat = showWorkbench || !showChat

  const setSelectedView = (view: WorkbenchViewType) => {
    workbenchStore.currentView.set(view);
  };

  useEffect(() => {
    if (hasPreview) {
      setSelectedView('preview');
    }
  }, [hasPreview]);

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

  const onFileSave = useCallback(async () => {
    try {
      await workbenchStore.saveCurrentDocument();
      toast.success('File saved and version updated');
    } catch (error) {
      console.error('Failed to save file or update version:', error);
      toast.error('Failed to update file content or version');
    }
  }, []);

  const onFileReset = useCallback(() => {
    workbenchStore.resetCurrentDocument();
  }, []);

  const innerWorkbench = (
    <div
          className={
            !isMobile 
              ? classNames(
                  `fixed top-[calc(var(--header-height)+1.5rem)] bottom-6 w-[var(--workbench-inner-width)] mr-4 z-0 transition-[left,width] duration-200 bolt-ease-cubic-bezier`,
                  {
                    'left-[var(--workbench-left)]': showWorkbench,
                    'left-[100%]': !showWorkbench,
                  }
                )
              : 'w-full h-full'
          }
        >
          <div className={classNames(
            'absolute flex inset-0',
            {
              'mr-5': showChat && !isMobile,
              'ml-10 mr-5': !showChat && !isMobile,
            }
          )}>
          {!isMobile && <div className="h-full flex">
            <button 
              className='w-8 h-20 my-auto bg-transparent text-bolt-elements-textTertiary z-50'
              onClick={() => {
                if (canHideChat) {
                  chatStore.setKey('showChat', !showChat);
                }
              }}
            >
              {showChat ? <div className="size-6 i-ph:caret-left" /> : <div className="size-6 i-ph:caret-right" />}
            </button>
          </div>}
    <div className={`w-full h-full flex flex-col bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor shadow-sm rounded-${isMobile ? 'none rounded-t-lg' : 'lg'} overflow-hidden`}>
      <div className="flex items-center px-3 py-2 border-b border-bolt-elements-borderColor">
        <Slider selected={selectedView} options={sliderOptions} setSelected={setSelectedView} />
        <div className="ml-auto" />
        {selectedView === 'code' && (
          <PanelHeaderButton
            className="mr-1 text-sm"
            onClick={() => {
              workbenchStore.toggleTerminal(!workbenchStore.showTerminal.get());
            }}
          >
            <div className="i-ph:terminal" />
            Toggle Terminal
          </PanelHeaderButton>
        )}
        <IconButton
          icon="i-ph:x-circle"
          className="-mr-1"
          size="xl"
          onClick={() => {
            workbenchStore.showWorkbench.set(false);
          }}
        />
      </div>
      <div className="relative flex-1 overflow-hidden">
        <View
          initial={{ x: selectedView === 'code' ? 0 : '-100%' }}
          animate={{ x: selectedView === 'code' ? 0 : '-100%' }}
        >
          <EditorPanel
            editorDocument={currentDocument}
            isStreaming={isStreaming}
            selectedFile={selectedFile}
            files={files}
            unsavedFiles={unsavedFiles}
            onFileSelect={onFileSelect}
            onEditorScroll={onEditorScroll}
            onEditorChange={onEditorChange}
            onFileSave={onFileSave}
            onFileReset={onFileReset}
          />
        </View>
        <View
          initial={{ x: selectedView === 'preview' ? 0 : '100%' }}
          animate={{ x: selectedView === 'preview' ? 0 : '100%' }}
        >
          <Preview />
        </View>
      </div>
      </div>
      </div>
    </div>
  );

  // Create a single workbench instance that's shared between mobile/desktop
  const workbenchInstance = useMemo(() => (
    <motion.div
      initial="closed"
      animate={showWorkbench ? 'open' : 'closed'}
      variants={isMobile ? undefined : workbenchVariants}
      className="z-workbench w-full h-full"
    >
          {innerWorkbench}
    </motion.div>
  ), [showWorkbench, isMobile, innerWorkbench]);

  if (!chatStarted) {
    return null;
  }

  // For mobile, wrap the same instance in a Drawer
  if (isMobile) {
    return (
      <Drawer
        open={showWorkbench}
        onOpenChange={(open) => workbenchStore.showWorkbench.set(open)}
      >
        <DrawerContent className="h-[90vh] p-4 ring-transparent border-transparent bg-transparent">
          {workbenchInstance}
        </DrawerContent>
      </Drawer>
    );
  }

  return workbenchInstance;
});

interface ViewProps extends HTMLMotionProps<'div'> {
  children: JSX.Element;
}

const View = memo(({ children, ...props }: ViewProps) => {
  return (
    <motion.div className="absolute inset-0" transition={viewTransition} {...props}>
      {children}
    </motion.div>
  );
});