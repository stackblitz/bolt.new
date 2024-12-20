import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { getAPIKey } from './api-key';

export const aiProvider = {
  openAI: 'openai',
  anthropic: 'anthropic',
  custom: 'custom',
} as const;

export type AiProviderType = (typeof aiProvider)[keyof typeof aiProvider];

export const defaultModels: Record<AiProviderType, string> = {
  [aiProvider.openAI]: 'chatgpt-4o-latest',
  [aiProvider.anthropic]: 'claude-3-5-sonnet-20240620',
  [aiProvider.custom]: 'llama3.1',
} as const;

export function isValidProvider(provider: string): provider is AiProviderType {
  return Object.values(aiProvider).includes(provider as AiProviderType);
}

export function getDefaultModel(provider: AiProviderType): string {
  return defaultModels[provider];
}

export function getAnthropicModel(env: Env) {
  const defaultModel = getDefaultModel(aiProvider.anthropic);
  const anthropic = createAnthropic({
    apiKey: getAPIKey(env),
  });

  return anthropic(process.env.MODEL || env.MODEL || defaultModel);
}

export function getOpenAIModel(env: Env) {
  const defaultModel = getDefaultModel(aiProvider.openAI);

  const openai = createOpenAI({
    compatibility: 'strict', // strict mode, enabled when using the OpenAI API
    apiKey: process.env.API_KEY || env.API_KEY,
  });

  return openai(process.env.MODEL || env.MODEL || defaultModel);
}

export function getCustomModel(env: Env) {
  const defaultModel = getDefaultModel(aiProvider.custom);
  const openaiCompatible = createOpenAI({
    compatibility: 'compatible',
    apiKey: process.env.API_KEY || env.API_KEY || 'bogus', // if local model, do not need api key
    baseURL: process.env.BASE_URL || env.BASE_URL || 'http://localhost:11434/v1',
  });

  return openaiCompatible(process.env.MODEL || env.MODEL || defaultModel);
}
