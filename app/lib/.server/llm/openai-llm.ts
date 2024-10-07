import { streamText as _streamText, convertToCoreMessages } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { MAX_TOKENS } from './constants';
import { getPrompts } from './prompts';
import type { LLM } from './llm-interface';
import type { Prompts } from './prompts-interface';
import type { Message, Messages, StreamingOptions }from './llm-interface';

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
    const model = openai('o1-mini');

    const o1sysmessage: Message = {
      role: 'user',
      content: this.getPrompts().getSystemPrompt()
    };

    // this is just some jank to get o1 working, proof of concept.
    // for 4o, update the model above, remove the o1sysmessage, and set the system prompt and maxTokens

    return _streamText({
      model: model as any, // Use type assertion to bypass strict type checking
      // system: this.getPrompts().getSystemPrompt(),
      messages: [o1sysmessage, ...convertToCoreMessages(messages)],
      // maxTokens: MAX_TOKENS,
      ...options,
    });
  }

  getPrompts(): Prompts {
    return getPrompts();
  }
}