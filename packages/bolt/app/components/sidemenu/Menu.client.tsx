import { Fragment, useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { motion, type Variants } from 'framer-motion';
import { cubicEasingFn } from '~/utils/easings';
import { db, getAll, type ChatHistory } from '~/lib/persistence';
import { HistoryItem } from './HistoryItem';
import { binDates } from './date-binning';

const menuVariants = {
  closed: {
    left: '-400px',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    left: 0,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

export function Menu() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState<ChatHistory[]>([]);
  const [open, setOpen] = useState(false);

  const loadEntries = useCallback(() => {
    if (db) {
      getAll(db)
        .then((list) => list.filter((item) => item.urlId && item.description))
        .then(setList)
        .catch((error) => toast.error(error.message));
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadEntries();
    }
  }, [open]);

  useEffect(() => {
    function onMouseMove(event: MouseEvent) {
      if (event.pageX < 80) {
        setOpen(true);
      }
    }

    function onMouseLeave(_event: MouseEvent) {
      setOpen(false);
    }

    menuRef.current?.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      menuRef.current?.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <motion.div
      ref={menuRef}
      initial="closed"
      animate={open ? 'open' : 'closed'}
      variants={menuVariants}
      className="flex flex-col side-menu fixed left-[-400px] top-0 w-[400px] h-full bg-white border-r border-gray-200 z-max"
    >
      <div className="flex items-center border-b border-gray-200 bg-white p-4 h-[var(--header-height)]">
        <a href="/" className="text-2xl font-semibold">
          Bolt
        </a>
      </div>
      <div className="m-4 ml-2 mt-7">
        <a href="/" className="text-white rounded-md bg-accent-600 p-2 font-semibold">
          Start new chat
        </a>
      </div>
      <div className="font-semibold m-2 ml-4">Your Chats</div>
      <div className="overflow-auto pb-2">
        {list.length === 0 && <div className="ml-4 text-gray">No previous conversations</div>}
        {binDates(list).map(({ category, items }) => (
          <Fragment key={category}>
            <div className="ml-4 text-gray m-2">{category}</div>
            {items.map((item) => (
              <HistoryItem key={item.id} item={item} loadEntries={loadEntries} />
            ))}
          </Fragment>
        ))}
      </div>
      <div className="border-t border-gray-200 h-[var(--header-height)]" />
    </motion.div>
  );
}
