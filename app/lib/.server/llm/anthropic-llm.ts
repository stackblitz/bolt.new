import {streamText as _streamText, convertToCoreMessages } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { MAX_TOKENS } from './constants';
import { getPrompts } from './prompts';
import type { LLM } from './llm-interface';
import type { Prompts } from './prompts-interface';
import type { Messages, StreamingOptions }from './llm-interface';

// export type Messages = Message[];

// export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model'>;

export class AnthropicLLM implements LLM {
  private apiKey: string = '';

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  streamText(messages: Messages, env: Env, options?: StreamingOptions) {
    if (!this.apiKey) {
      try {
        this.apiKey = env.ANTHROPIC_API_KEY;
      } catch (error) {
        throw new Error('API key is not set for AnthropicLLM');
      }
    }

    const anthropic = createAnthropic({ apiKey: this.apiKey });
    const model = anthropic('claude-3-5-sonnet-20240620');

    return _streamText({
      model,
      system: this.getPrompts().getSystemPrompt(),
      maxTokens: MAX_TOKENS,
      headers: {
        'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15',
      },
      messages: convertToCoreMessages(messages),
      ...options,
    });
  }

  getPrompts(): Prompts {
    return getPrompts();
  }
}