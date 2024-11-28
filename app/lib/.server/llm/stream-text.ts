// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck – TODO: Provider proper types

import { convertToCoreMessages, streamText as _streamText } from 'ai';
import { getModel } from '~/lib/.server/llm/model';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';
import { DEFAULT_MODEL, DEFAULT_PROVIDER, MODEL_LIST, MODEL_REGEX, PROVIDER_REGEX } from '~/utils/constants';

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
  // Extract model
  const modelMatch = message.content.match(MODEL_REGEX);
  const model = modelMatch ? modelMatch[1] : DEFAULT_MODEL;

  // Extract provider
  const providerMatch = message.content.match(PROVIDER_REGEX);
  const provider = providerMatch ? providerMatch[1] : DEFAULT_PROVIDER;

  // Remove model and provider lines from content
  const cleanedContent = message.content.replace(MODEL_REGEX, '').replace(PROVIDER_REGEX, '').trim();

  return { model, provider, content: cleanedContent };
}

export function streamText(messages: Messages, env: Env, options?: StreamingOptions, apiKeys?: Record<string, string>) {
  let currentModel = DEFAULT_MODEL;
  let currentProvider = DEFAULT_PROVIDER;

  const processedMessages = messages.map((message) => {
    if (message.role === 'user') {
      const { model, provider, content } = extractPropertiesFromMessage(message);

      if (MODEL_LIST.find((m) => m.name === model)) {
        currentModel = model;
      }

      currentProvider = provider;

      return { ...message, content };
    }

    return message;
  });

  const modelDetails = MODEL_LIST.find((m) => m.name === currentModel);

  const dynamicMaxTokens = modelDetails && modelDetails.maxTokenAllowed ? modelDetails.maxTokenAllowed : MAX_TOKENS;

  return _streamText({
    model: getModel(currentProvider, currentModel, env, apiKeys),
    system: getSystemPrompt(),
    maxTokens: dynamicMaxTokens,
    messages: convertToCoreMessages(processedMessages),
    ...options,
  });
}
