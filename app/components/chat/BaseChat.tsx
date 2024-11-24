/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import type { Message } from 'ai';
import React, { type RefCallback, useEffect, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { Menu } from '~/components/sidebar/Menu.client';
import { IconButton } from '~/components/ui/IconButton';
import { Workbench } from '~/components/workbench/Workbench.client';
import { classNames } from '~/utils/classNames';
import { MODEL_LIST, PROVIDER_LIST, initializeModelList } from '~/utils/constants';
import { Messages } from './Messages.client';
import { SendButton } from './SendButton.client';
import { APIKeyManager } from './APIKeyManager';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import * as Tooltip from '@radix-ui/react-tooltip';

import styles from './BaseChat.module.scss';
import type { ProviderInfo } from '~/utils/types';
import { ExportChatButton } from '~/components/chat/ExportChatButton';

const EXAMPLE_PROMPTS = [
  { text: 'Build a todo app in React using Tailwind' },
  { text: 'Build a simple blog using Astro' },
  { text: 'Create a cookie consent form using Material UI' },
  { text: 'Make a space invaders game' },
  { text: 'How do I center a div?' },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const providerList = PROVIDER_LIST;

// @ts-ignore TODO: Introduce proper types
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ModelSelector = ({ model, setModel, provider, setProvider, modelList, providerList, apiKeys }) => {
  return (
    <div className="mb-2 flex gap-2 flex-col sm:flex-row">
      <select
        value={provider?.name}
        onChange={(e) => {
          setProvider(providerList.find((p: ProviderInfo) => p.name === e.target.value));

          const firstModel = [...modelList].find((m) => m.provider == e.target.value);
          setModel(firstModel ? firstModel.name : '');
        }}
        className="flex-1 p-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus transition-all"
      >
        {providerList.map((provider: ProviderInfo) => (
          <option key={provider.name} value={provider.name}>
            {provider.name}
          </option>
        ))}
      </select>
      <select
        key={provider?.name}
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="flex-1 p-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus transition-all lg:max-w-[70%] "
      >
        {[...modelList]
          .filter((e) => e.provider == provider?.name && e.name)
          .map((modelOption) => (
            <option key={modelOption.name} value={modelOption.name}>
              {modelOption.label}
            </option>
          ))}
      </select>
    </div>
  );
};

const TEXTAREA_MIN_HEIGHT = 76;

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  messages?: Message[];
  description?: string;
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  model?: string;
  setModel?: (model: string) => void;
  provider?: ProviderInfo;
  setProvider?: (provider: ProviderInfo) => void;
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
  importChat?: (description: string, messages: Message[]) => Promise<void>;
  exportChat?: () => void;
}

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
      model,
      setModel,
      provider,
      setProvider,
      sendMessage,
      handleInputChange,
      enhancePrompt,
      handleStop,
      importChat,
      exportChat,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
    const [modelList, setModelList] = useState(MODEL_LIST);

    useEffect(() => {
      // Load API keys from cookies on component mount
      try {
        const storedApiKeys = Cookies.get('apiKeys');

        if (storedApiKeys) {
          const parsedKeys = JSON.parse(storedApiKeys);

          if (typeof parsedKeys === 'object' && parsedKeys !== null) {
            setApiKeys(parsedKeys);
          }
        }
      } catch (error) {
        console.error('Error loading API keys from cookies:', error);

        // Clear invalid cookie data
        Cookies.remove('apiKeys');
      }

      initializeModelList().then((modelList) => {
        setModelList(modelList);
      });
    }, []);

    const updateApiKey = (provider: string, key: string) => {
      try {
        const updatedApiKeys = { ...apiKeys, [provider]: key };
        setApiKeys(updatedApiKeys);

        // Save updated API keys to cookies with 30 day expiry and secure settings
        Cookies.set('apiKeys', JSON.stringify(updatedApiKeys), {
          expires: 30, // 30 days
          secure: true, // Only send over HTTPS
          sameSite: 'strict', // Protect against CSRF
          path: '/', // Accessible across the site
        });
      } catch (error) {
        console.error('Error saving API keys to cookies:', error);
      }
    };

    const chatImportButton = !chatStarted && (
      <div className="flex flex-col items-center justify-center flex-1 p-4">
        <input
          type="file"
          id="chat-import"
          className="hidden"
          accept=".json"
          onChange={async (e) => {
            const file = e.target.files?.[0];

            if (file && importChat) {
              try {
                const reader = new FileReader();

                reader.onload = async (e) => {
                  try {
                    const content = e.target?.result as string;
                    const data = JSON.parse(content);

                    if (!Array.isArray(data.messages)) {
                      toast.error('Invalid chat file format');
                    }

                    await importChat(data.description, data.messages);
                    toast.success('Chat imported successfully');
                  } catch (error: unknown) {
                    if (error instanceof Error) {
                      toast.error('Failed to parse chat file: ' + error.message);
                    } else {
                      toast.error('Failed to parse chat file');
                    }
                  }
                };
                reader.onerror = () => toast.error('Failed to read chat file');
                reader.readAsText(file);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to import chat');
              }
              e.target.value = ''; // Reset file input
            } else {
              toast.error('Something went wrong');
            }
          }}
        />
        <div className="flex flex-col items-center gap-4 max-w-2xl text-center">
          <div className="flex gap-2">
            <button
              onClick={() => {
                const input = document.getElementById('chat-import');
                input?.click();
              }}
              className="px-4 py-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 transition-all flex items-center gap-2"
            >
              <div className="i-ph:upload-simple" />
              Import Chat
            </button>
          </div>
        </div>
      </div>
    );

    const baseChat = (
      <div
        ref={ref}
        className={classNames(
          styles.BaseChat,
          'relative flex flex-col lg:flex-row h-full w-full overflow-hidden bg-bolt-elements-background-depth-1',
        )}
        data-chat-visible={showChat}
      >
        <ClientOnly>{() => <Menu />}</ClientOnly>
        <div ref={scrollRef} className="flex flex-col lg:flex-row overflow-y-auto w-full h-full">
          <div className={classNames(styles.Chat, 'flex flex-col flex-grow lg:min-w-[var(--chat-min-width)] h-full')}>
            {!chatStarted && (
              <div id="intro" className="mt-[26vh] max-w-chat mx-auto text-center px-4 lg:px-0">
                <h1 className="text-3xl lg:text-6xl font-bold text-bolt-elements-textPrimary mb-4 animate-fade-in">
                  Where ideas begin
                </h1>
                <p className="text-md lg:text-xl mb-8 text-bolt-elements-textSecondary animate-fade-in animation-delay-200">
                  Bring ideas to life in seconds or get help on existing projects.
                </p>
              </div>
            )}
            <div
              className={classNames('pt-6 px-2 sm:px-6', {
                'h-full flex flex-col': chatStarted,
              })}
            >
              <ClientOnly>
                {() => {
                  return chatStarted ? (
                    <Messages
                      ref={messageRef}
                      className="flex flex-col w-full flex-1 max-w-chat pb-6 mx-auto z-1"
                      messages={messages}
                      isStreaming={isStreaming}
                    />
                  ) : null;
                }}
              </ClientOnly>
              <div
                className={classNames(
                  ' bg-bolt-elements-background-depth-2 p-3 rounded-lg border border-bolt-elements-borderColor relative w-full max-w-chat mx-auto z-prompt mb-6',
                  {
                    'sticky bottom-2': chatStarted,
                  },
                )}
              >
                <ModelSelector
                  key={provider?.name + ':' + modelList.length}
                  model={model}
                  setModel={setModel}
                  modelList={modelList}
                  provider={provider}
                  setProvider={setProvider}
                  providerList={PROVIDER_LIST}
                  apiKeys={apiKeys}
                />

                {provider && (
                  <APIKeyManager
                    provider={provider}
                    apiKey={apiKeys[provider.name] || ''}
                    setApiKey={(key) => updateApiKey(provider.name, key)}
                  />
                )}

                <div
                  className={classNames(
                    'shadow-lg border border-bolt-elements-borderColor bg-bolt-elements-prompt-background backdrop-filter backdrop-blur-[8px] rounded-lg overflow-hidden transition-all',
                  )}
                >
                  <textarea
                    ref={textareaRef}
                    className={`w-full pl-4 pt-4 pr-16 focus:outline-none focus:ring-0 focus:border-none focus:shadow-none resize-none text-md text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent transition-all`}
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
                  <div className="flex justify-between items-center text-sm p-4 pt-2">
                    <div className="flex gap-1 items-center">
                      <IconButton
                        title="Enhance prompt"
                        disabled={input.length === 0 || enhancingPrompt}
                        className={classNames('transition-all', {
                          'opacity-100!': enhancingPrompt,
                          'text-bolt-elements-item-contentAccent! pr-1.5 enabled:hover:bg-bolt-elements-item-backgroundAccent!':
                            promptEnhanced,
                        })}
                        onClick={() => enhancePrompt?.()}
                      >
                        {enhancingPrompt ? (
                          <>
                            <div className="i-svg-spinners:90-ring-with-bg text-bolt-elements-loader-progress text-xl animate-spin"></div>
                            <div className="ml-1.5">Enhancing prompt...</div>
                          </>
                        ) : (
                          <>
                            <div className="i-bolt:stars text-xl"></div>
                            {promptEnhanced && <div className="ml-1.5">Prompt enhanced</div>}
                          </>
                        )}
                      </IconButton>
                      {chatStarted && <ClientOnly>{() => <ExportChatButton exportChat={exportChat} />}</ClientOnly>}
                    </div>
                    {input.length > 3 ? (
                      <div className="text-xs text-bolt-elements-textTertiary">
                        Use <kbd className="kdb px-1.5 py-0.5 rounded bg-bolt-elements-background-depth-2">Shift</kbd> +{' '}
                        <kbd className="kdb px-1.5 py-0.5 rounded bg-bolt-elements-background-depth-2">Return</kbd> for
                        a new line
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            {chatImportButton}
            {!chatStarted && (
              <div id="examples" className="relative w-full max-w-xl mx-auto mt-8 flex justify-center">
                <div className="flex flex-col space-y-2 [mask-image:linear-gradient(to_bottom,black_0%,transparent_180%)] hover:[mask-image:none]">
                  {EXAMPLE_PROMPTS.map((examplePrompt, index) => {
                    return (
                      <button
                        key={index}
                        onClick={(event) => {
                          sendMessage?.(event, examplePrompt.text);
                        }}
                        className="group flex items-center w-full gap-2 justify-center bg-transparent text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary transition-theme"
                      >
                        {examplePrompt.text}
                        <div className="i-ph:arrow-bend-down-left" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <ClientOnly>{() => <Workbench chatStarted={chatStarted} isStreaming={isStreaming} />}</ClientOnly>
        </div>
      </div>
    );

    return <Tooltip.Provider delayDuration={200}>{baseChat}</Tooltip.Provider>;
  },
);
