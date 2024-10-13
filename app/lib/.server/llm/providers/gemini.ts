import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { ModelFactory } from './modelFactory';

export function getGeminiModel(apiKey: string, modelName: string = 'gemini-1.5-pro-latest') {
  const model = createGoogleGenerativeAI({
    apiKey,
  });

  return model(modelName);
}

export class GeminiFactory implements ModelFactory {
  createModel(apiKey: string, modelName: string) {
    return getGeminiModel(apiKey, modelName);
  }
}
