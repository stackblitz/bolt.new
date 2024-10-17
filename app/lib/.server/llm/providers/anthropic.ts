import { createAnthropic } from '@ai-sdk/anthropic';
import type { ModelFactory } from './modelFactory';

export function getAnthropicModel(apiKey: string, modelName: string = 'claude-3-5-sonnet-20240620') {
  const anthropic = createAnthropic({
    apiKey,
  });

  return anthropic(modelName);
}

export class AnthropicFactory implements ModelFactory {
  createModel(apiKey: string, modelName: string) {
    return getAnthropicModel(apiKey, modelName);
  }
}
