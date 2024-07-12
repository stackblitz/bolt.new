import { useStore } from '@nanostores/react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { IconButton } from '~/components/ui/IconButton';
import { cubicEasingFn } from '~/utils/easings';
import { workspaceStore } from '../../lib/stores/workspace';

interface WorkspaceProps {
  chatStarted?: boolean;
}

const workspaceVariants = {
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
      duration: 0.5,
      type: 'spring',
    },
  },
} satisfies Variants;

export function Workspace({ chatStarted }: WorkspaceProps) {
  const showWorkspace = useStore(workspaceStore.showWorkspace);

  return (
    chatStarted && (
      <AnimatePresence>
        {showWorkspace && (
          <motion.div initial="closed" animate="open" exit="closed" variants={workspaceVariants}>
            <div className="fixed top-[calc(var(--header-height)+1.5rem)] bottom-6 w-[50vw] mr-4 z-0">
              <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden absolute inset-0 right-8">
                <header className="px-3 py-2 border-b border-gray-200">
                  <IconButton
                    icon="i-ph:x-circle"
                    className="ml-auto"
                    size="xxl"
                    onClick={() => {
                      workspaceStore.showWorkspace.set(false);
                    }}
                  />
                </header>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  );
}
