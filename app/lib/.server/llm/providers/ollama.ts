import { createOllama } from 'ollama-ai-provider';
import type { ModelFactory } from './modelFactory';

export function getOllamaModel(apiKey: string, modelName: string = 'llama3.2:latest') {
  const model = createOllama({
    baseURL: 'http://172.21.208.1:11434',
  });
  return model(modelName);
}

export class OllamaFactory implements ModelFactory {
  createModel(apiKey: string, modelName: string) {
    return getOllamaModel(apiKey, modelName);
  }
}
