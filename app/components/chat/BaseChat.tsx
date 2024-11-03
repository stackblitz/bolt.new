import type { Message } from 'ai';
import React, { type RefCallback } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { Menu } from '~/components/sidebar/Menu.client';
import { IconButton } from '~/components/ui/IconButton';
import { Workbench } from '~/components/workbench/Workbench.client';
import { classNames } from '~/utils/classNames';
import { Messages } from './Messages.client';
import { SendButton } from './SendButton.client';

import styles from './BaseChat.module.scss';
import { ArrowBigLeftIcon } from 'lucide-react';
import { ProviderSelector } from './ProviderSelector';

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  messages?: Message[];
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
  append: (message: { role: 'user', content: string }) => void;
  isLoading: boolean;
}

const EXAMPLE_PROMPTS = [
  { text: 'Start a blog with Astro' },
  { text: 'Build a mobile app with NativeScript' },
  { text: 'Create a docs site with Vitepress' },
  { text: 'Scaffold UI with shadcn' },
  { text: 'Draft a presentation with Slidev' },
  { text: 'Code a video with Remotion' },
];

const TEXTAREA_MIN_HEIGHT = 76;

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      messageRef,
      scrollRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      enhancingPrompt = false,
      promptEnhanced = false,
      messages,
      input = '',
      sendMessage,
      handleInputChange,
      enhancePrompt,
      handleStop,
      append,
      isLoading,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;

    return (
      <div
        ref={ref}
        className={classNames(
          styles.BaseChat,
          'relative flex h-full w-full overflow-hidden',
        )}
        data-chat-visible={showChat}
      >
        <div className="flex absolute bottom-0 justify-center items-end py-3 px-3 text-bolt-elements-textTertiary">
        <div className="i-ph:sidebar-simple-duotone text-xl" />
        </div>
        <ClientOnly>{() => <Menu />}</ClientOnly>
        <div ref={scrollRef} className="flex overflow-y-auto w-full h-full pl-7">
          <div className={classNames(styles.Chat, 'flex flex-col flex-grow min-w-[var(--chat-min-width)] h-full')}>
            {!chatStarted && (
              <div id="intro" className="mt-[26vh] max-w-full mx-auto">
                <h1 className="text-5xl text-center font-bold text-bolt-elements-textPrimary mb-2">
                What do you want to build?
                </h1>
                <p className="mb-4 text-center text-bolt-elements-textSecondary">
                  Bring ideas to life in seconds or get help on existing projects.
                </p>
              </div>
            )}
            <div
              className={classNames('pt-6 px-4', {
                'h-full flex flex-col': chatStarted,
              })}
            >
              <ClientOnly>
                {() => {
                  return chatStarted ? (
                    <Messages
                      ref={messageRef}
                      className="flex flex-col w-full flex-1 max-w-chat px-4 pb-6 mx-auto z-1"
                      messages={messages}
                      isStreaming={isStreaming}
                    />
                  ) : null;
                }}
              </ClientOnly>
              <div
                className={classNames('relative w-full max-w-chat mx-auto z-prompt', {
                  'sticky bottom-0': chatStarted,
                })}
              >
                <div className="p-[0.7px] rounded-lg bg-[linear-gradient(160deg,#2767B1_5%,#00BEF9_10%,transparent_20%)]">
                  <div
                    className={classNames(
                      'shadow-sm bg-[#141414] border border-bolt-elements-borderColor backdrop-filter backdrop-blur-[8px]',
                      'rounded-lg overflow-hidden'
                    )}
                  >
                    <textarea
                      ref={textareaRef}
                      className={`w-full pl-4 pt-4 pr-16 focus:outline-none resize-none text-md 
                                 text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary 
                                 bg-transparent`}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          if (event.shiftKey) {
                            return;
                          }

                          event.preventDefault();

                          sendMessage?.(event);
                        }
                      }}
                      value={input}
                      onChange={(event) => {
                        handleInputChange?.(event);
                      }}
                      style={{
                        minHeight: TEXTAREA_MIN_HEIGHT,
                        maxHeight: TEXTAREA_MAX_HEIGHT,
                      }}
                      placeholder="How can Bolt help you today?"
                      translate="no"
                    />
                    <ClientOnly>
                      {() => (
                        <SendButton
                          show={input.length > 0 || isStreaming}
                          isStreaming={isStreaming}
                          onClick={(event) => {
                            if (isStreaming) {
                              handleStop?.();
                              return;
                            }

                            sendMessage?.(event);
                          }}
                        />
                      )}
                    </ClientOnly>
                    <div className="flex justify-between text-sm p-4 pt-2">
                      <div className="flex gap-0 items-center">
                        <IconButton
                          title="Enhance prompt"
                          disabled={input.length === 0 || enhancingPrompt}
                          className={classNames({
                            'opacity-100!': enhancingPrompt,
                            'text-bolt-elements-item-contentAccent! pr-1.5 enabled:hover:bg-bolt-elements-item-backgroundAccent!':
                              promptEnhanced,
                          })}
                          onClick={() => enhancePrompt?.()}
                        >
                          {enhancingPrompt ? (
                            <>
                              <div className="i-svg-spinners:90-ring-with-bg text-bolt-elements-loader-progress text-xl"></div>
                              <div className="ml-1.5">Enhancing prompt...</div>
                            </>
                          ) : (
                            <>
                              <div className="i-bolt:stars text-xl"></div>
                              {promptEnhanced && <div className="ml-1.5">Prompt enhanced</div>}
                            </>
                          )}
                        </IconButton>
                        <ClientOnly>
                          {() => <ProviderSelector />}
                        </ClientOnly>
                      </div>
                      {input.length > 3 ? (
                        <div className="text-xs text-bolt-elements-textTertiary">
                          Use <kbd className="kdb">Shift</kbd> + <kbd className="kdb">Return</kbd> for a new line
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="bg-bolt-elements-background-depth-1 pb-6">{/* Ghost Element */}</div>
              </div>
            </div>
            {!chatStarted && (
              <div id="examples" className="relative w-full max-w-3xl mx-auto mt-8">
                <div className="flex flex-wrap justify-center gap-4">
                  {EXAMPLE_PROMPTS.map((examplePrompt, index) => (
                    <button
                      key={index}
                      onClick={(event) => {
                        sendMessage?.(event, examplePrompt.text);
                      }}
                      className="px-3 py-1 text-xs rounded-full border border-bolt-elements-borderColor 
                                 bg-transparent text-bolt-elements-textSecondary 
                                 hover:text-bolt-elements-textPrimary hover:border-bolt-elements-borderColorHover 
                                 transition-all duration-200"
                    >
                      {examplePrompt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <ClientOnly>
            {() => (
              <Workbench chatStarted={chatStarted} isStreaming={isStreaming} />
            )}
          </ClientOnly>
        </div>
      </div>
    );
  },
);
