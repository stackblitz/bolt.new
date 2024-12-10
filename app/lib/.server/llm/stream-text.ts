import { streamText as _streamText, convertToCoreMessages } from 'ai';

import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';
import { createGroq } from '@ai-sdk/groq';


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

const groq = createGroq();

export function streamText(messages: Messages, env: Env, options?: StreamingOptions) {
  return _streamText({
    model: groq(env.MODEL_NAME ?? 'gemma2-9b-it'),
    system: getSystemPrompt(),
    maxTokens: MAX_TOKENS,
    headers: {
      'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15',
    },
    messages: convertToCoreMessages(messages),
    ...options,
  });
}
