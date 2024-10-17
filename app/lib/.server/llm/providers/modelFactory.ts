import type { LanguageModel } from 'ai';
export interface ModelFactory {
  createModel(apiKey: string, modelName: string): LanguageModel;
}
