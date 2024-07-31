import { toast } from 'react-toastify';
import { useCallback, useEffect, useState, useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { cubicEasingFn } from '~/utils/easings';
import { IconButton } from '~/components/ui/IconButton';
import { db, deleteId, type ChatHistory } from '~/lib/persistence';

const iconVariants = {
  closed: {
    transform: 'translate(40px,0)',
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    transform: 'translate(0,0)',
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

export function HistoryItem({ item, loadEntries }: { item: ChatHistory; loadEntries: () => void }) {
  const [requestingDelete, setRequestingDelete] = useState(false);
  const [hovering, setHovering] = useState(false);
  const hoverRef = useRef<HTMLDivElement>(null);

  const deleteItem = useCallback(() => {
    if (db) {
      deleteId(db, item.id)
        .then(() => loadEntries())
        .catch((error) => toast.error(error.message));
    }
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;

    function mouseEnter() {
      setHovering(true);

      if (timeout) {
        clearTimeout(timeout);
      }
    }

    function mouseLeave() {
      setHovering(false);

      // wait for animation to finish before unsetting
      timeout = setTimeout(() => {
        setRequestingDelete(false);
      }, 200);
    }

    hoverRef.current?.addEventListener('mouseenter', mouseEnter);
    hoverRef.current?.addEventListener('mouseleave', mouseLeave);

    return () => {
      hoverRef.current?.removeEventListener('mouseenter', mouseEnter);
      hoverRef.current?.removeEventListener('mouseleave', mouseLeave);
    };
  }, []);

  return (
    <div className="ml-3 mr-1">
      <div
        ref={hoverRef}
        className="rounded-md hover:bg-gray-200 p-1 overflow-hidden flex justify-between items-center"
      >
        <a href={`/chat/${item.urlId}`} className="truncate block pr-1">
          {item.description}
        </a>
        <motion.div initial="closed" animate={hovering ? 'open' : 'closed'} variants={iconVariants}>
          {requestingDelete ? (
            <IconButton icon="i-ph:check" onClick={deleteItem} />
          ) : (
            <IconButton icon="i-ph:trash" onClick={() => setRequestingDelete(true)} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
