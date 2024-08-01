import { motion, type Variants } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { IconButton } from '~/components/ui/IconButton';
import { db, getAll, type ChatHistory } from '~/lib/persistence';
import { cubicEasingFn } from '~/utils/easings';
import { HistoryItem } from './HistoryItem';
import { binDates } from './date-binning';

const menuVariants = {
  closed: {
    opacity: 0,
    left: '-150px',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    opacity: 1,
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
      className="flex flex-col side-menu fixed top-0 w-[350px] h-full bg-white border-r rounded-r-3xl border-gray-200 z-max shadow-xl text-sm"
    >
      <div className="flex items-center p-4 h-[var(--header-height)]">
        <img src="/logo_text.svg" width="60px" alt="Bolt Logo" />
      </div>
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        <div className="p-4">
          <a
            href="/"
            className="flex gap-2 items-center text-accent-600 rounded-md bg-accent-600/12 hover:bg-accent-600/15 p-2 font-medium"
          >
            <span className="inline-block i-blitz:chat scale-110" />
            Start new chat
          </a>
        </div>
        <div className="font-semibold pl-6 pr-5 my-2">Your Chats</div>
        <div className="flex-1 overflow-scroll pl-4 pr-5 pb-5">
          {list.length === 0 && <div className="pl-2 text-gray">No previous conversations</div>}
          {binDates(list).map(({ category, items }) => (
            <div key={category} className="mt-4 first:mt-0 space-y-1">
              <div className="text-gray sticky top-0 z-20 bg-white pl-2 pt-2 pb-1">{category}</div>
              {items.map((item) => (
                <HistoryItem key={item.id} item={item} loadEntries={loadEntries} />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center border-t p-4">
          <a href="/logout">
            <IconButton className="p-1.5 gap-1.5">
              <>
                Logout <span className="i-ph:sign-out text-lg" />
              </>
            </IconButton>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
