import type { Message } from 'ai';
import { classNames } from '../../utils/classNames';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';
import React from 'react';

interface MessagesProps {
  id?: string;
  className?: string;
  isStreaming?: boolean;
  messages?: Message[];
}

export const Messages = React.forwardRef<HTMLDivElement, MessagesProps>((props: MessagesProps, ref) => {
  const { id, isStreaming = false, messages = [] } = props;

  return (
    <div id={id} ref={ref} className={props.className}>
      {messages.length > 0
        ? messages.map((message, i) => {
            const { role, content } = message;
            const isUser = role === 'user';
            const isFirst = i === 0;
            const isLast = i === messages.length - 1;
            const isUserMessage = message.role === 'user';
            const isAssistantMessage = message.role === 'assistant';

            return (
              <div
                key={message.id}
                className={classNames('relative overflow-hidden rounded-md p-[1px]', {
                  'mt-4': !isFirst,
                  'bg-gray-200': isUserMessage || !isStreaming || (isStreaming && isAssistantMessage && !isLast),
                  'bg-gradient-to-b from-gray-200 to-transparent': isStreaming && isAssistantMessage && isLast,
                })}
              >
                <div
                  className={classNames('flex gap-4 p-6 w-full rounded-[calc(0.375rem-1px)]', {
                    'bg-white': isUserMessage || !isStreaming || (isStreaming && !isLast),
                    'bg-gradient-to-b from-white from-30% to-transparent': isStreaming && isLast,
                  })}
                >
                  <div
                    className={classNames(
                      'flex items-center justify-center min-w-[34px] min-h-[34px] text-gray-600 rounded-md p-1 self-start',
                      {
                        'bg-gray-100': isUserMessage,
                        'bg-accent text-xl': isAssistantMessage,
                      },
                    )}
                  >
                    <div className={isUserMessage ? 'i-ph:user-fill text-xl' : 'i-blitz:logo'}></div>
                  </div>
                  <div className="grid grid-col-1 w-full">
                    {isUser ? <UserMessage content={content} /> : <AssistantMessage content={content} />}
                  </div>
                </div>
              </div>
            );
          })
        : null}
      {isStreaming && <div className="text-center w-full i-svg-spinners:3-dots-fade text-4xl mt-4"></div>}
    </div>
  );
});
