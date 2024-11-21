// @ts-nocheck
// Preventing TS checks with files presented in the video for a better presentation.
import { streamText as _streamText, convertToCoreMessages } from 'ai';
import { getModel } from '~/lib/.server/llm/model';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';
import { MODEL_LIST, DEFAULT_MODEL, DEFAULT_PROVIDER, MODEL_REGEX, PROVIDER_REGEX } from '~/utils/constants';

interface ToolResult<Name extends string, Args, Result> {
  toolCallId: string;
  toolName: Name;
  args: Args;
  result: Result;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolResult<string, unknown, unknown>[];
  model?: string;
}

export type Messages = Message[];

export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model'>;

function extractPropertiesFromMessage(message: Message): { model: string; provider: string; content: string } {
  const textContent = Array.isArray(message.content)
    ? message.content.find(item => item.type === 'text')?.text || ''
    : message.content;

  const modelMatch = textContent.match(MODEL_REGEX);
  const providerMatch = textContent.match(PROVIDER_REGEX);

  // Extract model
  // const modelMatch = message.content.match(MODEL_REGEX);
  const model = modelMatch ? modelMatch[1] : DEFAULT_MODEL;

  // Extract provider
  // const providerMatch = message.content.match(PROVIDER_REGEX);
  const provider = providerMatch ? providerMatch[1] : DEFAULT_PROVIDER;

  const cleanedContent = Array.isArray(message.content)
    ? message.content.map(item => {
      if (item.type === 'text') {
        return {
          type: 'text',
          text: item.text?.replace(MODEL_REGEX, '').replace(PROVIDER_REGEX, '')
        };
      }
      return item; // Preserve image_url and other types as is
    })
    : textContent.replace(MODEL_REGEX, '').replace(PROVIDER_REGEX, '');

  // console.log('Model from message:', model);
  // console.log('Found in MODEL_LIST:', MODEL_LIST.find((m) => m.name === model));
  // console.log('Current MODEL_LIST:', MODEL_LIST);

  return { model, provider, content: cleanedContent };
}

export function streamText(
  messages: Messages,
  env: Env,
  options?: StreamingOptions,
  apiKeys?: Record<string, string>
) {
  let currentModel = DEFAULT_MODEL;
  let currentProvider = DEFAULT_PROVIDER;

  // console.log('StreamText:', JSON.stringify(messages));

  const processedMessages = messages.map((message) => {
    if (message.role === 'user') {
      const { model, provider, content } = extractPropertiesFromMessage(message);

      if (MODEL_LIST.find((m) => m.name === model)) {
        currentModel = model;
      }

      currentProvider = provider;

      return { ...message, content };
    }

    return message; // No changes for non-user messages
  });

  // console.log('Message content:', messages[0].content);
  // console.log('Extracted properties:', extractPropertiesFromMessage(messages[0]));

  const llmClient = getModel(currentProvider, currentModel, env, apiKeys);
  // console.log('LLM Client:', llmClient);

  const llmConfig = {
    ...options,
    model: llmClient, //getModel(currentProvider, currentModel, env, apiKeys),
    provider: currentProvider,
    system: getSystemPrompt(),
    maxTokens: MAX_TOKENS,
    messages: convertToCoreMessages(processedMessages),
  };

  // console.log('LLM Config:', llmConfig);

  return _streamText(llmConfig);
}
