import { streamText as _streamText, convertToCoreMessages } from 'ai';
import { getAPIKey } from '~/lib/.server/llm/api-key';
import { getModel } from '~/lib/.server/llm/model';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';
import type { Env } from './env';
import type { Provider } from '~/lib/stores/provider';

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

export function streamText(messages: Messages, env: Env, provider: Provider, options?: StreamingOptions) {
  const apiKey = getAPIKey(env, provider);
  const model = provider === 'anthropic'
    ? getModel('anthropic', apiKey)
    : getModel('together', apiKey, (provider as { type: 'together'; model: string }).model);

  return _streamText({
    model,
    system: getSystemPrompt(),
    messages: convertToCoreMessages(messages.map(message => ({
      ...message,
      toolInvocations: message.toolInvocations?.map(invocation => ({
        ...invocation,
        state: "result" as const
      }))
    }))),
    ...options,
  });
}