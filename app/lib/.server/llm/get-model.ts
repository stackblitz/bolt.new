import type { ModelFactory } from './providers/modelFactory';
import { AnthropicFactory } from './providers/anthropic';
import { OpenAiFactory } from './providers/openAi';
import { GeminiFactory } from './providers/gemini';
import { OllamaFactory } from './providers/ollama';

export function getModelFactory(provider: string): ModelFactory {
  switch (provider.toLowerCase()) {
    case 'anthropic': {
      return new AnthropicFactory();
    }
    case 'openai': {
      return new OpenAiFactory();
    }
    case 'gemini': {
      return new GeminiFactory();
    }
    case 'ollama': {
      return new OllamaFactory();
    }
    default: {
      throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
