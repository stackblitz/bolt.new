import { useNavigate, useLoaderData } from '@remix-run/react';
import { useState, useEffect } from 'react';
import type { Message } from 'ai';
import { openDatabase, setMessages, getMessages, getNextID } from './db';
import { toast } from 'react-toastify';

export interface ChatHistory {
  id: string;
  displayName?: string;
  messages: Message[];
}

const persistenceEnabled = !import.meta.env.VITE_DISABLE_PERSISTENCE;

const db = persistenceEnabled ? await openDatabase() : undefined;

export function useChatHistory() {
  const navigate = useNavigate();
  const { id: chatId } = useLoaderData<{ id?: string }>();

  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [entryId, setEntryId] = useState<string | undefined>();

  useEffect(() => {
    if (!db) {
      setReady(true);

      if (persistenceEnabled) {
        toast.error(`Chat persistence is unavailable`);
      }

      return;
    }

    if (chatId) {
      getMessages(db, chatId)
        .then((storedMessages) => {
          if (storedMessages && storedMessages.messages.length > 0) {
            setInitialMessages(storedMessages.messages);
          } else {
            navigate(`/`, { replace: true });
          }

          setReady(true);
        })
        .catch((error) => {
          toast.error(error.message);
        });
    }
  }, []);

  return {
    ready: !chatId || ready,
    initialMessages,
    storeMessageHistory: async (messages: Message[]) => {
      if (!db || messages.length === 0) {
        return;
      }

      if (initialMessages.length === 0) {
        if (!entryId) {
          const nextId = await getNextID(db);

          await setMessages(db, nextId, messages);

          setEntryId(nextId);

          /**
           * FIXME: Using the intended navigate function causes a rerender for <Chat /> that breaks the app.
           *
           * `navigate(`/chat/${nextId}`, { replace: true });`
           */
          const url = new URL(window.location.href);
          url.pathname = `/chat/${nextId}`;

          window.history.replaceState({}, '', url);
        } else {
          await setMessages(db, entryId, messages);
        }
      } else {
        await setMessages(db, chatId as string, messages);
      }
    },
  };
}
