import type { Message } from 'ai';
import { useCallback, useState } from 'react';
import { StreamingMessageParser } from '~/lib/runtime/message-parser';
import { workspaceStore } from '~/lib/stores/workspace';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('useMessageParser');

const messageParser = new StreamingMessageParser({
  callbacks: {
    onArtifactOpen: (messageId, { title }) => {
      logger.debug('onArtifactOpen', title);
      workspaceStore.updateArtifact(messageId, { title, closed: false });
    },
    onArtifactClose: (messageId) => {
      logger.debug('onArtifactClose');
      workspaceStore.updateArtifact(messageId, { closed: true });
    },
    onAction: (messageId, { type, path, content }) => {
      console.log('ACTION', messageId, { type, path, content });
    },
  },
});

export function useMessageParser() {
  const [parsedMessages, setParsedMessages] = useState<{ [key: number]: string }>({});

  const parseMessages = useCallback((messages: Message[], isLoading: boolean) => {
    let reset = false;

    if (import.meta.env.DEV && !isLoading) {
      reset = true;
      messageParser.reset();
    }

    for (const [index, message] of messages.entries()) {
      if (message.role === 'assistant') {
        /**
         * In production, we only parse the last assistant message since previous messages can't change.
         * During development they can change, e.g., if the parser gets modified.
         */
        if (import.meta.env.PROD && index < messages.length - 1) {
          continue;
        }

        const newParsedContent = messageParser.parse(message.id, message.content);

        setParsedMessages((prevParsed) => ({
          ...prevParsed,
          [index]: !reset ? (prevParsed[index] || '') + newParsedContent : newParsedContent,
        }));
      }
    }
  }, []);

  return { parsedMessages, parseMessages };
}
