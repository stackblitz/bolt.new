import type { Message } from 'ai';
import { useRef } from 'react';
import { classNames } from '~/utils/classNames';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';

interface MessagesProps {
  id?: string;
  classNames?: { root?: string; messagesContainer?: string };
  isLoading?: boolean;
  messages?: Message[];
}

export function Messages(props: MessagesProps) {
  const { id, isLoading, messages = [] } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div id={id} ref={containerRef} className={props.classNames?.root}>
      <div className={classNames('flex flex-col', props.classNames?.messagesContainer)}>
        {messages.length > 0
          ? messages.map((message, i) => {
              const { role, content } = message;
              const isUser = role === 'user';
              const isFirst = i === 0;

              return (
                <div
                  key={message.id}
                  className={classNames('flex gap-4 border rounded-md p-6 bg-white/80 backdrop-blur-sm', {
                    'mt-4': !isFirst,
                  })}
                >
                  <div
                    className={classNames(
                      'flex items-center justify-center min-w-[34px] min-h-[34px] text-gray-600 rounded-md p-1 self-start',
                      {
                        'bg-gray-100': role === 'user',
                        'bg-accent text-xl': role === 'assistant',
                      },
                    )}
                  >
                    <div className={role === 'user' ? 'i-ph:user-fill text-xl' : 'i-blitz:logo'}></div>
                  </div>
                  {isUser ? <UserMessage content={content} /> : <AssistantMessage content={content} />}
                </div>
              );
            })
          : null}
        {isLoading && <div className="text-center w-full i-svg-spinners:3-dots-fade text-4xl mt-4"></div>}
      </div>
    </div>
  );
}
