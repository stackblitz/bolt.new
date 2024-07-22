import { useStore } from '@nanostores/react';
import { AnimatePresence, motion } from 'framer-motion';
import { computed } from 'nanostores';
import { memo, useEffect, useRef, useState } from 'react';
import { createHighlighter, type BundledLanguage, type BundledTheme, type HighlighterGeneric } from 'shiki';
import type { ActionState } from '../../lib/runtime/action-runner';
import { chatStore } from '../../lib/stores/chat';
import { workbenchStore } from '../../lib/stores/workbench';
import { classNames } from '../../utils/classNames';
import { cubicEasingFn } from '../../utils/easings';

const highlighterOptions = {
  langs: ['shell'],
  themes: ['light-plus', 'dark-plus'],
};

const shellHighlighter: HighlighterGeneric<BundledLanguage, BundledTheme> =
  import.meta.hot?.data.shellHighlighter ?? (await createHighlighter(highlighterOptions));

if (import.meta.hot) {
  import.meta.hot.data.shellHighlighter = shellHighlighter;
}

interface ArtifactProps {
  messageId: string;
}

export const Artifact = memo(({ messageId }: ArtifactProps) => {
  const userToggledActions = useRef(false);
  const [showActions, setShowActions] = useState(false);

  const chat = useStore(chatStore);
  const artifacts = useStore(workbenchStore.artifacts);
  const artifact = artifacts[messageId];

  const actions = useStore(
    computed(artifact.runner.actions, (actions) => {
      return Object.values(actions);
    }),
  );

  const toggleActions = () => {
    userToggledActions.current = true;
    setShowActions(!showActions);
  };

  useEffect(() => {
    if (actions.length && !showActions && !userToggledActions.current) {
      setShowActions(true);
    }
  }, [actions]);

  return (
    <div className="flex flex-col overflow-hidden border rounded-lg w-full">
      <div className="flex">
        <button
          className="flex items-stretch bg-gray-50/25 w-full overflow-hidden"
          onClick={() => {
            const showWorkbench = workbenchStore.showWorkbench.get();
            workbenchStore.showWorkbench.set(!showWorkbench);
          }}
        >
          <div className="flex items-center px-6 bg-gray-100/50">
            {!artifact?.closed && !chat.aborted ? (
              <div className="i-svg-spinners:90-ring-with-bg scale-130"></div>
            ) : (
              <div className="i-ph:code-bold scale-130 text-gray-600"></div>
            )}
          </div>
          <div className="px-4 p-3 w-full text-left">
            <div className="w-full">{artifact?.title}</div>
            <small className="inline-block w-full w-full">Click to open Workbench</small>
          </div>
        </button>
        <AnimatePresence>
          {actions.length && (
            <motion.button
              initial={{ width: 0 }}
              animate={{ width: 'auto' }}
              exit={{ width: 0 }}
              transition={{ duration: 0.15, ease: cubicEasingFn }}
              className="hover:bg-gray-200"
              onClick={toggleActions}
            >
              <div className="p-4">
                <div className={showActions ? 'i-ph:caret-up-bold' : 'i-ph:caret-down-bold'}></div>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showActions && actions.length > 0 && (
          <motion.div
            className="actions"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: '0px' }}
            transition={{ duration: 0.15 }}
          >
            <div className="p-4 text-left border-t">
              <ActionList actions={actions} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

function getTextColor(status: ActionState['status']) {
  switch (status) {
    case 'pending': {
      return 'text-gray-500';
    }
    case 'running': {
      return 'text-gray-1000';
    }
    case 'complete': {
      return 'text-positive-600';
    }
    case 'aborted': {
      return 'text-gray-600';
    }
    case 'failed': {
      return 'text-negative-600';
    }
    default: {
      return undefined;
    }
  }
}

interface ShellCodeBlockProps {
  classsName?: string;
  code: string;
}

function ShellCodeBlock({ classsName, code }: ShellCodeBlockProps) {
  return (
    <div
      className={classNames('text-xs', classsName)}
      dangerouslySetInnerHTML={{ __html: shellHighlighter.codeToHtml(code, { lang: 'shell', theme: 'dark-plus' }) }}
    ></div>
  );
}

interface ActionListProps {
  actions: ActionState[];
}

const actionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ActionList = memo(({ actions }: ActionListProps) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
      <ul className="list-none space-y-2.5">
        {actions.map((action, index) => {
          const { status, type, content } = action;

          return (
            <motion.li
              key={index}
              variants={actionVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.2,
                ease: cubicEasingFn,
              }}
            >
              <div className="flex items-center gap-1.5">
                <div className={classNames('text-lg', getTextColor(action.status))}>
                  {status === 'running' ? (
                    <div className="i-svg-spinners:90-ring-with-bg"></div>
                  ) : status === 'pending' ? (
                    <div className="i-ph:circle-duotone"></div>
                  ) : status === 'complete' ? (
                    <div className="i-ph:check-circle-duotone"></div>
                  ) : status === 'failed' || status === 'aborted' ? (
                    <div className="i-ph:x-circle-duotone"></div>
                  ) : null}
                </div>
                {type === 'file' ? (
                  <div>
                    Create <code className="bg-gray-100 text-gray-700">{action.filePath}</code>
                  </div>
                ) : type === 'shell' ? (
                  <div className="flex items-center w-full min-h-[28px]">
                    <span className="flex-1">Run command</span>
                  </div>
                ) : null}
              </div>
              {type === 'shell' && <ShellCodeBlock classsName="mt-1" code={content} />}
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
});
