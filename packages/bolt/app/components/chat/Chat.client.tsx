import { useChat } from 'ai/react';
import { cubicBezier, useAnimate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useMessageParser, usePromptEnhancer } from '~/lib/hooks';
import { createScopedLogger } from '~/utils/logger';
import { BaseChat } from './BaseChat';
import { Messages } from './Messages';

const logger = createScopedLogger('Chat');
const customEasingFn = cubicBezier(0.4, 0, 0.2, 1);

export function Chat() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [chatStarted, setChatStarted] = useState(false);

  const [animationScope, animate] = useAnimate();

  const { messages, isLoading, input, handleInputChange, setInput, handleSubmit } = useChat({
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

    await Promise.all([
      animate('#chat', { height: '100%' }, { duration: 0.3, ease: customEasingFn }),
      animate('#intro', { opacity: 0, display: 'none' }, { duration: 0.15, ease: customEasingFn }),
    ]);

    setChatStarted(true);
  };

  const sendMessage = () => {
    if (input.length === 0) {
      return;
    }

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
      enhancingPrompt={enhancingPrompt}
      promptEnhanced={promptEnhanced}
      sendMessage={sendMessage}
      handleInputChange={handleInputChange}
      messagesSlot={
        chatStarted ? (
          <Messages
            classNames={{
              root: 'h-full pt-10',
              messagesContainer: 'max-w-2xl mx-auto max-md:pb-[calc(140px+1.5rem)] md:pb-[calc(140px+3rem)]',
            }}
            messages={messages.map((message, i) => {
              if (message.role === 'user') {
                return message;
              }

              return {
                ...message,
                content: parsedMessages[i] || '',
              };
            })}
            isLoading={isLoading}
          />
        ) : null
      }
      enhancePrompt={() => {
        enhancePrompt(input, (input) => {
          setInput(input);
          scrollTextArea();
        });
      }}
    ></BaseChat>
  );
}
