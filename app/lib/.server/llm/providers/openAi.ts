import { createOpenAI } from '@ai-sdk/openai';
import type { ModelFactory } from './modelFactory';

export function getOpenAiModel(apiKey: string, modelName: string = 'gpt-4o-mini') {
  const model = createOpenAI({
    apiKey,
  });

  return model(modelName);
}

export class OpenAiFactory implements ModelFactory {
  createModel(apiKey: string, modelName: string) {
    return getOpenAiModel(apiKey, modelName);
  }
}
