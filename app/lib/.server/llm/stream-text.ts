import { generateText as _generateText, streamText as _streamText, convertToCoreMessages } from 'ai';
import { getAIModel } from '~/lib/.server/llm/model';
import type { AIEnvironment, AIProvider } from './api-key';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';

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
}

export type Messages = Message[];

export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model'>;

export function streamText(
  messages: Messages,
  env: AIEnvironment | undefined,
  options?: StreamingOptions,
) {
  return _streamText({
    model: getAIModel(env),
    system: getSystemPrompt(),
    maxTokens: MAX_TOKENS,
    messages: convertToCoreMessages(messages),
    ...options,
  });
}


export type GenerationOptions = Omit<Parameters<typeof _generateText>[0], 'model'>;

export function generateText(
  messages: Messages,
  env: AIEnvironment | undefined,
  options?: GenerationOptions,
  providerOverride?: AIProvider,
) {
  return _generateText({
    model: getAIModel(env, providerOverride),
    system: getSystemPrompt(),
    maxTokens: MAX_TOKENS,
    messages: convertToCoreMessages(messages),
    ...options,
  });
}
