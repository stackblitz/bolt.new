import { motion, type Variants } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Dialog, DialogButton, DialogDescription, DialogRoot, DialogTitle } from '~/components/ui/Dialog';
import { IconButton } from '~/components/ui/IconButton';
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';
import { db, deleteById, getAll, chatId, type ChatHistoryItem } from '~/lib/persistence';
import { cubicEasingFn } from '~/utils/easings';
import { logger } from '~/utils/logger';
import { HistoryItem } from './HistoryItem';
import { binDates } from './date-binning';
import type { User } from '@supabase/supabase-js';
import { createClient } from '~/utils/supabase.client';
import { useAuth } from '~/lib/hooks/useAuth';
import { Button } from '../ui/button';
import { LogOut, SettingsIcon } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { chatStore } from '~/lib/stores/chat';
import Settings from './settings/Settings';

const menuVariants: Variants = {
  closed: {
    opacity: 0,
    visibility: 'hidden',
    left: '-150px',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    opacity: 1,
    visibility: 'initial',
    left: 0,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
};

type DialogContent = { type: 'delete'; item: ChatHistoryItem } | null;

export function Menu() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState<ChatHistoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<DialogContent>(null);
  const { user, isLoading } = useAuth();
  const { showChat } = useStore(chatStore);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const loadEntries = useCallback(() => {
    if (db) {
      getAll(db)
        .then((list) => list.filter((item) => item.urlId && item.description))
        .then(setList)
        .catch((error) => toast.error(error.message));
    }
  }, []);

  const deleteItem = useCallback((event: React.UIEvent, item: ChatHistoryItem) => {
    event.preventDefault();

    if (db) {
      deleteById(db, item.id)
        .then(() => {
          loadEntries();

          if (chatId.get() === item.id) {
            // hard page navigation to clear the stores
            window.location.pathname = '/';
          }
        })
        .catch((error) => {
          toast.error('Failed to delete conversation');
          logger.error(error);
        });
    }
  }, []);

  const closeDialog = () => {
    setDialogContent(null);
  };

  useEffect(() => {
    if (open) {
      loadEntries();
    }
  }, [open]);

  useEffect(() => {
    const enterThreshold = 40;
    const exitThreshold = 40;

    function onMouseMove(event: MouseEvent) {
      if (event.pageX < enterThreshold && showChat) {
        setOpen(true);
      }

      if (menuRef.current && event.clientX > menuRef.current.getBoundingClientRect().right + exitThreshold) {
        setOpen(false);
      }
    }

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [showChat]);

  useEffect(() => {
    if (!showChat) {
      setOpen(false);
    }
  }, [showChat]);

  return (
    <motion.div
      ref={menuRef}
      initial="closed"
      animate={(open && showChat) ? 'open' : 'closed'}
      variants={menuVariants}
      className="flex flex-col side-menu fixed top-0 w-full sm:w-[280px] md:w-[320px] lg:w-[350px] h-full z-20"
    >
      <div className="p-[0.7px] h-full rounded-r-3xl bg-[linear-gradient(155deg,#2767B1_5%,#00BEF9_10%,transparent_20%)]">
        <div className="flex flex-col h-full bg-bolt-elements-background-depth-2 border-r rounded-r-3xl border-bolt-elements-borderColor shadow-xl shadow-bolt-elements-sidebar-dropdownShadow text-sm">
          <div className="flex items-center justify-between h-[var(--header-height)] px-4 border-b border-bolt-elements-borderColor">
            <a href="/" className="text-xl sm:text-2xl font-semibold text-accent flex items-center text-bolt-elements-textPrimary">
              <span className="i-bolt:logo-text?mask w-[38px] sm:w-[46px] inline-block" />
            </a>
            <button 
              onClick={() => setOpen(false)}
              className="sm:hidden flex items-center justify-center p-2 bg-transparent text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary rounded-md hover:bg-bolt-elements-item-backgroundActive"
            >
              <span className="i-ph:x-bold text-xl" />
            </button>
          </div>
          <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
            <div className="p-4">
              <a
                href="/"
                className="flex gap-2 items-center bg-bolt-elements-sidebar-buttonBackgroundDefault text-bolt-elements-sidebar-buttonText hover:bg-bolt-elements-sidebar-buttonBackgroundHover rounded-md p-2 transition-theme"
              >
                <span className="inline-block i-bolt:chat scale-110" />
                Start new chat
              </a>
            </div>
            <div className="text-bolt-elements-textPrimary font-medium pl-6 pr-5 my-2">Your Chats</div>
            <div className="flex-1 overflow-scroll pl-4 pr-5 pb-5">
              {list.length === 0 && <div className="pl-2 text-bolt-elements-textTertiary">No previous conversations</div>}
              <DialogRoot open={dialogContent !== null}>
                {binDates(list).map(({ category, items }) => (
                  <div key={category} className="mt-4 first:mt-0 space-y-1">
                    <div className="text-bolt-elements-textTertiary sticky top-0 z-1 bg-bolt-elements-background-depth-2 pl-2 pt-2 pb-1">
                      {category}
                    </div>
                    {items.map((item) => (
                      <HistoryItem key={item.id} item={item} onDelete={() => setDialogContent({ type: 'delete', item })} />
                    ))}
                  </div>
                ))}
                <Dialog onBackdrop={closeDialog} onClose={closeDialog}>
                  {dialogContent?.type === 'delete' && (
                    <>
                      <DialogTitle>Delete Chat?</DialogTitle>
                      <DialogDescription asChild>
                        <div>
                          <p>
                            You are about to delete <strong>{dialogContent.item.description}</strong>.
                          </p>
                          <p className="mt-1">Are you sure you want to delete this chat?</p>
                        </div>
                      </DialogDescription>
                      <div className="px-5 pb-4 bg-bolt-elements-background-depth-2 flex gap-2 justify-end">
                        <DialogButton type="secondary" onClick={closeDialog}>
                          Cancel
                        </DialogButton>
                        <DialogButton
                          type="danger"
                          onClick={(event) => {
                            deleteItem(event, dialogContent.item);
                            closeDialog();
                          }}
                        >
                          Delete
                        </DialogButton>
                      </div>
                    </>
                  )}
                </Dialog>
              </DialogRoot>
            </div>
            <div className="flex items-center justify-between border-t border-bolt-elements-borderColor p-4">
              <div className="flex items-center gap-1 rounded text-white">
                {user?.user_metadata?.avatar_url && (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="User Avatar" 
                    className="p-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full" 
                  />
                )}
                <div className="flex flex-col pl-2 max-w-[160px] sm:max-w-[225px]">
                  <div className="text-bolt-elements-textPrimary truncate">
                    {user?.user_metadata?.full_name || user?.email}
                  </div>
                  <div className="text-bolt-elements-textTertiary text-sm truncate hidden sm:block">
                    {user?.user_metadata?.email}
                  </div>
                </div>
              </div>
              {user && (
                <div className="flex items-center gap-0">
                  <Settings 
                    isOpen={isSettingsOpen}
                    onOpenChange={setIsSettingsOpen}
                  />
                  <form action="/logout" method="post" className="rounded-md text-bolt-elements-textTertiary hover:bg-bolt-elements-item-backgroundActive">
                    <Button type="submit" className="h-auto w-auto flex items-center justify-center p-0.5 m-0 bg-transparent hover:text-bolt-elements-textPrimary">
                      <LogOut className="p-1 rounded-md hover:text-bolt-elements-textPrimary" />
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
