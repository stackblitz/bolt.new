import { useChat } from 'ai/react';
import { useAnimate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useMessageParser, usePromptEnhancer } from '../../lib/hooks';
import { chatStore } from '../../lib/stores/chat';
import { workbenchStore } from '../../lib/stores/workbench';
import { cubicEasingFn } from '../../utils/easings';
import { createScopedLogger } from '../../utils/logger';
import { BaseChat } from './BaseChat';

const logger = createScopedLogger('Chat');

export function Chat() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [chatStarted, setChatStarted] = useState(false);

  const [animationScope, animate] = useAnimate();

  const { messages, isLoading, input, handleInputChange, setInput, handleSubmit, stop } = useChat({
    api: '/api/chat',
    onError: (error) => {
      logger.error(error);
    },
    onFinish: () => {
      logger.debug('Finished streaming');
    },
  });

  const { enhancingPrompt, promptEnhanced, enhancePrompt, resetEnhancer } = usePromptEnhancer();
  const { parsedMessages, parseMessages } = useMessageParser();

  const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;

  useEffect(() => {
    parseMessages(messages, isLoading);
  }, [messages, isLoading, parseMessages]);

  const scrollTextArea = () => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.scrollTop = textarea.scrollHeight;
    }
  };

  const abort = () => {
    stop();
    chatStore.setKey('aborted', true);
    workbenchStore.abortAllActions();
  };

  useEffect(() => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = 'auto';

      const scrollHeight = textarea.scrollHeight;

      textarea.style.height = `${Math.min(scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
      textarea.style.overflowY = scrollHeight > TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
    }
  }, [input, textareaRef]);

  const runAnimation = async () => {
    if (chatStarted) {
      return;
    }

    await animate('#intro', { opacity: 0, flex: 1 }, { duration: 0.2, ease: cubicEasingFn });

    setChatStarted(true);
  };

  const sendMessage = () => {
    if (input.length === 0) {
      return;
    }

    chatStore.setKey('aborted', false);

    runAnimation();
    handleSubmit();
    resetEnhancer();

    textareaRef.current?.blur();
  };

  return (
    <BaseChat
      ref={animationScope}
      textareaRef={textareaRef}
      input={input}
      chatStarted={chatStarted}
      isStreaming={isLoading}
      enhancingPrompt={enhancingPrompt}
      promptEnhanced={promptEnhanced}
      sendMessage={sendMessage}
      handleInputChange={handleInputChange}
      handleStop={abort}
      messages={messages.map((message, i) => {
        if (message.role === 'user') {
          return message;
        }

        return {
          ...message,
          content: parsedMessages[i] || '',
        };
      })}
      enhancePrompt={() => {
        enhancePrompt(input, (input) => {
          setInput(input);
          scrollTextArea();
        });
      }}
    ></BaseChat>
  );
}
