import type { Message } from 'ai';
import React, { type RefCallback, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { Menu } from '~/components/sidebar/Menu.client';
import { IconButton } from '~/components/ui/IconButton';
import { Workbench } from '~/components/workbench/Workbench.client';
import { classNames } from '~/utils/classNames';
import { Messages } from './Messages.client';
import { SendButton } from './SendButton.client'


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
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
      <div
        ref={ref}
        className={classNames(
          styles.BaseChat,
          'relative flex h-screen w-full overflow-hidden max-w-[100vw]'
        )}
        data-chat-visible={showChat}
      >
        <div className="flex absolute bottom-0 justify-center items-end py-3 px-3 text-bolt-elements-textTertiary">
          <div className="i-ph:sidebar-simple-duotone text-xl" />
        </div>
        <ClientOnly>{() => <Menu />}</ClientOnly>

        <div className="flex flex-1 w-full h-full">
          <div ref={scrollRef} className="flex flex-1 overflow-y-auto w-full h-full pl-2 sm:pl-7 justify-center">
            <div className={classNames(
              styles.Chat, 
              'flex flex-col flex-grow h-full w-full',
              'max-w-full lg:max-w-[var(--chat-min-width)]'
            )}>
              {!chatStarted && (
                <div id="intro" className="mt-[15vh] max-w-full mx-auto px-4 sm:px-0">
                  <h1 className="text-3xl sm:text-5xl text-center font-bold text-bolt-elements-textPrimary mb-2">
                    What do you want to build?
                  </h1>
                  <p className="mb-4 text-center text-sm sm:text-base text-bolt-elements-textSecondary">
                    Bring ideas to life in seconds or get help on existing projects.
                  </p>
                </div>
              )}
              <div className={classNames('pt-6 sm:pt-4 px-6 sm:px-4', {
                'h-full flex flex-col ': chatStarted,
              })}>
                <ClientOnly>
                  {() => chatStarted ? (
                    <Messages
                      ref={messageRef}
                      className="flex flex-col w-full flex-1 max-w-chat px-2 sm:px-4 pb-4 sm:pb-6 mx-auto z-1"
                      messages={messages}
                      isStreaming={isStreaming}
                    />
                  ) : null}
                </ClientOnly>
                <div className={classNames(
                  'relative w-full max-w-chat mx-auto z-prompt',
                  'px-2 sm:px-0',
                  { 'sticky bottom-0': chatStarted }
                )}>
                  <div className="p-[0.7px] rounded-lg bg-[linear-gradient(160deg,#2767B1_5%,#00BEF9_10%,transparent_20%)]">
                    <div className={classNames(
                      'shadow-sm bg-[#141414] border border-bolt-elements-borderColor backdrop-filter backdrop-blur-[8px]',
                      'rounded-lg overflow-hidden'
                    )}>
                      <textarea
                        ref={textareaRef}
                        className="w-full pl-3 sm:pl-4 pt-4 pr-12 sm:pr-16 focus:outline-none resize-none 
                                text-sm sm:text-md text-bolt-elements-textPrimary 
                                placeholder-bolt-elements-textTertiary bg-transparent"
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
                      <div className="flex justify-between text-xs sm:text-sm p-2 sm:p-4 pt-2">
                        <div className="flex gap-0 items-center">
                          <IconButton
                            title="Enhance prompt"
                            disabled={input.length === 0 || enhancingPrompt}
                            className={classNames(
                              'scale-90 sm:scale-100',
                              {
                                'opacity-100!': enhancingPrompt,
                                'text-bolt-elements-item-contentAccent! pr-1.5 enabled:hover:bg-bolt-elements-item-backgroundAccent!':
                                  promptEnhanced,
                              }
                            )}
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
                          <div className="hidden sm:block text-xs text-bolt-elements-textTertiary">
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
                <div id="examples" className="relative w-full max-w-3xl mx-auto mt-4 sm:mt-8 px-4 sm:px-0">
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                    {EXAMPLE_PROMPTS.map((examplePrompt, index) => (
                      <button
                        key={index}
                        onClick={(event) => sendMessage?.(event, examplePrompt.text)}
                        className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs rounded-full border 
                               border-bolt-elements-borderColor bg-transparent text-bolt-elements-textSecondary 
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
