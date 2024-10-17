// @ts-nocheck
// Preventing TS checks with files presented in the video for a better presentation.
import { getAPIKey, getAWSCredentials } from '~/lib/.server/llm/api-key';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { ollama } from 'ollama-ai-provider';
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export function getAnthropicModel(apiKey: string, model: string) {
  const anthropic = createAnthropic({
    apiKey,
  });

  return anthropic(model);
}

export function getOpenAIModel(apiKey: string, model: string) {
  const openai = createOpenAI({
    apiKey,
  });

  return openai(model);
}

export function getGroqModel(apiKey: string, model: string) {
  const openai = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey,
  });

  return openai(model);
}

export function getOllamaModel(model: string) {
  return ollama(model);
}

export function getOpenRouterModel(apiKey: string, model: string) {
  const openRouter = createOpenRouter({
    apiKey
  });

  return openRouter.chat(model);
}

export function getBedrockModel(modelId: string, credentials: any) {
  const bedrock = createAmazonBedrock({
    region: credentials.region,
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
  });

  return bedrock(modelId);
}

export function getModel(provider: string, model: string, env: Env) {
  if (provider === 'Bedrock') {
    const credentials = getAWSCredentials(env);
    return getBedrockModel(model, credentials);
  }

  const apiKey = getAPIKey(env, provider);
  
  switch (provider) {
    case 'Anthropic':
      return getAnthropicModel(apiKey, model);
    case 'OpenAI':
      return getOpenAIModel(apiKey, model);
    case 'Groq':
      return getGroqModel(apiKey, model);
    case 'OpenRouter':
      return getOpenRouterModel(apiKey, model);
    default:
      return getOllamaModel(model);
  }
}
