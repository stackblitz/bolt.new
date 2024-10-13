import { streamText as _streamText, convertToCoreMessages } from 'ai';
import { getAPIKey } from '~/lib/.server/llm/api-key';
import { getModelFactory } from '~/lib/.server/llm/get-model';
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

export function streamText(messages: Messages, env: Env, options?: StreamingOptions) {
  const provider = env.PROVIDER || 'anthropic';
  const modelName = env.MODEL_NAME || 'default-model';
  const factory = getModelFactory(provider);

  const model = factory.createModel(getAPIKey(env), modelName);

  return _streamText({
    model,
    system: getSystemPrompt(),
    maxTokens: MAX_TOKENS,
    headers:
      provider === 'anthropic'
        ? {
            'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15',
          }
        : undefined,
    messages: convertToCoreMessages(messages),
    ...options,
  });
}
