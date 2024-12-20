import { streamText as _streamText, convertToCoreMessages } from 'ai';
import { getAnthropicModel, getOpenAIModel, getCustomModel } from '~/lib/.server/llm/model';
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
  const aiProvider = process.env.AI_PROVIDER || env.AI_PROVIDER || 'anthropic';

  switch (aiProvider) {
    case 'anthropic': {
      return _streamText({
        model: getAnthropicModel(env),
        system: getSystemPrompt(),
        maxTokens: MAX_TOKENS,
        messages: convertToCoreMessages(messages),
        ...options,
      });
    }

    case 'openai': {
      return _streamText({
        model: getOpenAIModel(env),
        system: getSystemPrompt(),
        maxTokens: MAX_TOKENS,
        messages: convertToCoreMessages(messages),
        ...options,
      });
    }

    case 'custom': {
      return _streamText({
        model: getCustomModel(env),
        system: getSystemPrompt(),
        maxTokens: MAX_TOKENS,
        messages,
        ...options,
      });
    }

    default: {
      throw new Error(`Invalid AI provider: ${aiProvider}`);
    }
  }
}
