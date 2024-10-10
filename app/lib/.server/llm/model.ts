import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from "@ai-sdk/openai";

export function getAnthropicModel(apiKey: string) {
  const anthropic = createAnthropic({
    apiKey,
  });

  return anthropic('claude-3-5-sonnet-20240620');
}

export function getTogetherAIModel(apiKey: string, modelName: string) {
  const together = createOpenAI({
    apiKey,
    baseURL: "https://api.together.xyz/v1",
  });

  return together(modelName);
}

export function getModel(provider: 'anthropic' | 'together', apiKey: string, modelName?: string) {
  return provider === 'anthropic' 
    ? getAnthropicModel(apiKey) 
    : getTogetherAIModel(apiKey, modelName || 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo');
}
