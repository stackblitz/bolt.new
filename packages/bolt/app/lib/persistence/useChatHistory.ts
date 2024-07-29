import { useNavigate, useLoaderData } from '@remix-run/react';
import { useState, useEffect } from 'react';
import type { Message } from 'ai';
import { openDatabase, setMessages, getMessages, getNextId, getUrlId } from './db';
import { toast } from 'react-toastify';
import { workbenchStore } from '~/lib/stores/workbench';

export interface ChatHistory {
  id: string;
  urlId?: string;
  description?: string;
  messages: Message[];
}

const persistenceEnabled = !import.meta.env.VITE_DISABLE_PERSISTENCE;

export const db = persistenceEnabled ? await openDatabase() : undefined;

export function useChatHistory() {
  const navigate = useNavigate();
  const { id: mixedId } = useLoaderData<{ id?: string }>();

  const [chatId, setChatId] = useState(mixedId);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [entryId, setEntryId] = useState<string | undefined>();
  const [urlId, setUrlId] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();

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
            setUrlId(storedMessages.urlId);
            setDescription(storedMessages.description);
            setChatId(storedMessages.id);
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

      const { firstArtifact } = workbenchStore;

      if (!urlId && firstArtifact?.id) {
        const urlId = await getUrlId(db, firstArtifact.id);

        navigateChat(urlId);
        setUrlId(urlId);
      }

      if (!description && firstArtifact?.title) {
        setDescription(firstArtifact?.title);
      }

      if (initialMessages.length === 0) {
        if (!entryId) {
          const nextId = await getNextId(db);

          await setMessages(db, nextId, messages, urlId, description);

          setEntryId(nextId);

          if (!urlId) {
            navigateChat(nextId);
          }
        } else {
          await setMessages(db, entryId, messages, urlId, description);
        }
      } else {
        await setMessages(db, chatId as string, messages, urlId, description);
      }
    },
  };
}

function navigateChat(nextId: string) {
  /**
   * FIXME: Using the intended navigate function causes a rerender for <Chat /> that breaks the app.
   *
   * `navigate(`/chat/${nextId}`, { replace: true });`
   */
  const url = new URL(window.location.href);
  url.pathname = `/chat/${nextId}`;

  window.history.replaceState({}, '', url);
}
