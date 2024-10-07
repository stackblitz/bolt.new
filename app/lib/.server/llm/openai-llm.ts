import { streamText as _streamText, convertToCoreMessages } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { MAX_TOKENS } from './constants';
import { getPrompts } from './prompts';
import type { LLM } from './llm-interface';
import type { Prompts } from './prompts-interface';
import type { Messages, StreamingOptions }from './llm-interface';

// export type Messages = Message[];

// export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model'>;

export class OpenAILLM implements LLM {
  private apiKey: string = '';

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  streamText(messages: Messages, env: Env, options?: StreamingOptions) {
    if (!this.apiKey) {
        try {
            this.apiKey = env.OPENAI_API_KEY;
        } catch (error) {

          throw new Error('API key is not set for OpenAILLM');
        }
    }

    const openai = createOpenAI({ apiKey: this.apiKey, compatibility: 'strict' });
    const model = openai('gpt-4o');

    return _streamText({
      model: model as any, // Use type assertion to bypass strict type checking
      system: this.getPrompts().getSystemPrompt(),
      messages: 
        // { role: 'system', content: this.getPrompts().getSystemPrompt() },
        convertToCoreMessages(messages),
      maxTokens: MAX_TOKENS,
      ...options,
    });
  }

  getPrompts(): Prompts {
    return getPrompts();
  }
}