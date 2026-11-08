import { useLoaderData, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { atom } from 'nanostores';
import type { Message } from 'ai';
import { toast } from 'react-toastify';
import { workbenchStore } from '~/lib/stores/workbench';
import { getMessages, getNextId, getUrlId, setMessages, withDatabase } from './db';

export interface ChatHistoryItem {
  id: string;
  urlId?: string;
  description?: string;
  messages: Message[];
  timestamp: string;
}

const persistenceEnabled = !import.meta.env.VITE_DISABLE_PERSISTENCE;

export const chatId = atom<string | undefined>(undefined);
export const description = atom<string | undefined>(undefined);

export function useChatHistory() {
  const navigate = useNavigate();
  const { id: mixedId } = useLoaderData<{ id?: string }>();

  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [urlId, setUrlId] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    if (!mixedId || !persistenceEnabled) {
      setReady(true);
      return () => {
        cancelled = true;
      };
    }

    const loadHistory = async () => {
      try {
        await withDatabase(async (database) => {
          const storedMessages = await getMessages(database, mixedId);

          if (cancelled) {
            return;
          }

          if (storedMessages && storedMessages.messages.length > 0) {
            setInitialMessages(storedMessages.messages);
            setUrlId(storedMessages.urlId);
            description.set(storedMessages.description);
            chatId.set(storedMessages.id);
          } else {
            navigate('/', { replace: true });
          }
        });
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        console.error('[BeamCore] Could not load saved chat history:', error);
        toast.error(`Could not load this saved chat. Starting a fresh chat instead. ${detail}`);

        if (!cancelled) {
          navigate('/', { replace: true });
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    };

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [mixedId, navigate]);

  return {
    ready: !mixedId || ready,
    initialMessages,
    storeMessageHistory: async (messages: Message[]) => {
      if (!persistenceEnabled || messages.length === 0) {
        return;
      }

      await withDatabase(async (database) => {
        const { firstArtifact } = workbenchStore;
        let currentUrlId = urlId;
        let currentDescription = description.get();
        let currentChatId = chatId.get();

        if (!currentUrlId && firstArtifact?.id) {
          currentUrlId = await getUrlId(database, firstArtifact.id);
          navigateChat(currentUrlId);
          setUrlId(currentUrlId);
        }

        if (!currentDescription && firstArtifact?.title) {
          currentDescription = firstArtifact.title;
          description.set(currentDescription);
        }

        if (initialMessages.length === 0 && !currentChatId) {
          currentChatId = await getNextId(database);
          chatId.set(currentChatId);

          if (!currentUrlId) {
            navigateChat(currentChatId);
          }
        }

        if (!currentChatId) {
          throw new Error('Chat history could not be assigned a local ID.');
        }

        await setMessages(database, currentChatId, messages, currentUrlId, currentDescription);
      });
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
