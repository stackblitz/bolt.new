import type { Message } from 'ai';
import type { LegacyRef } from 'react';
import React from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { IconButton } from '~/components/ui/IconButton';
import { Workspace } from '~/components/workspace/Workspace.client';
import { classNames } from '~/utils/classNames';
import { Messages } from './Messages.client';
import { SendButton } from './SendButton.client';

interface BaseChatProps {
  textareaRef?: LegacyRef<HTMLTextAreaElement> | undefined;
  messagesSlot?: React.ReactNode;
  workspaceSlot?: React.ReactNode;
  chatStarted?: boolean;
  isStreaming?: boolean;
  messages?: Message[];
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  sendMessage?: () => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
}

const EXAMPLES = [{ text: 'Example' }, { text: 'Example' }, { text: 'Example' }, { text: 'Example' }];

const TEXTAREA_MIN_HEIGHT = 72;

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      chatStarted = false,
      isStreaming = false,
      enhancingPrompt = false,
      promptEnhanced = false,
      messages,
      input = '',
      sendMessage,
      handleInputChange,
      enhancePrompt,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;

    return (
      <div ref={ref} className="relative flex h-full w-full overflow-hidden ">
        <div className="flex overflow-scroll w-full h-full">
          <div id="chat" className="flex flex-col w-full h-full px-6">
            {!chatStarted && (
              <div id="intro" className="mt-[20vh] mb-14 max-w-3xl mx-auto">
                <h2 className="text-4xl text-center font-bold text-slate-800 mb-2">Where ideas begin.</h2>
                <p className="mb-14 text-center">Bring ideas to life in seconds or get help on existing projects.</p>
                <div className="grid max-md:grid-cols-[repeat(1,1fr)] md:grid-cols-[repeat(2,minmax(300px,1fr))] gap-4">
                  {EXAMPLES.map((suggestion, index) => (
                    <button key={index} className="p-4 rounded-lg shadow-xs bg-white border border-gray-200 text-left">
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div
              className={classNames('pt-10', {
                'h-full flex flex-col': chatStarted,
              })}
            >
              <ClientOnly>
                {() => {
                  return chatStarted ? (
                    <Messages
                      className="flex flex-col w-full flex-1 max-w-3xl px-4 pb-10 mx-auto z-1"
                      messages={messages}
                      isStreaming={isStreaming}
                    />
                  ) : null;
                }}
              </ClientOnly>
              <div
                className={classNames('relative w-full max-w-3xl md:mx-auto z-2', {
                  'sticky bottom-0 bg-bolt-elements-app-backgroundColor': chatStarted,
                })}
              >
                <div
                  className={classNames('shadow-sm mb-6 border border-gray-200 bg-white rounded-lg overflow-hidden')}
                >
                  <textarea
                    ref={textareaRef}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        if (event.shiftKey) {
                          return;
                        }

                        event.preventDefault();

                        sendMessage?.();
                      }
                    }}
                    value={input}
                    onChange={(event) => {
                      handleInputChange?.(event);
                    }}
                    className={`w-full pl-4 pt-4 pr-16 focus:outline-none resize-none`}
                    style={{
                      minHeight: TEXTAREA_MIN_HEIGHT,
                      maxHeight: TEXTAREA_MAX_HEIGHT,
                    }}
                    placeholder="How can Bolt help you today?"
                    translate="no"
                  />
                  <ClientOnly>{() => <SendButton show={input.length > 0} onClick={sendMessage} />}</ClientOnly>
                  <div className="flex justify-between text-sm p-4 pt-2">
                    <div className="flex gap-1 items-center">
                      <IconButton icon="i-ph:microphone-duotone" className="-ml-1" />
                      <IconButton icon="i-ph:plus-circle-duotone" />
                      <IconButton icon="i-ph:pencil-simple-duotone" />
                      <IconButton
                        disabled={input.length === 0 || enhancingPrompt}
                        className={classNames({
                          'opacity-100!': enhancingPrompt,
                          'text-accent! pr-1.5 enabled:hover:bg-accent/12!': promptEnhanced,
                        })}
                        onClick={() => enhancePrompt?.()}
                      >
                        {enhancingPrompt ? (
                          <>
                            <div className="i-svg-spinners:90-ring-with-bg text-black text-xl"></div>
                            <div className="ml-1.5">Enhancing prompt...</div>
                          </>
                        ) : (
                          <>
                            <div className="i-blitz:stars text-xl"></div>
                            {promptEnhanced && <div className="ml-1.5">Prompt enhanced</div>}
                          </>
                        )}
                      </IconButton>
                    </div>
                    {input.length > 3 ? (
                      <div className="text-xs">
                        Use <kbd className="bg-gray-100 p-1 rounded-md">Shift</kbd> +{' '}
                        <kbd className="bg-gray-100 p-1 rounded-md">Return</kbd> for a new line
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ClientOnly>{() => <Workspace chatStarted={chatStarted} />}</ClientOnly>
        </div>
      </div>
    );
  },
);
