// @ts-nocheck
// Preventing TS checks with files presented in the video for a better presentation.
import { getAPIKey, getBaseURL } from '~/lib/.server/llm/api-key';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { ollama } from 'ollama-ai-provider';
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { mistral } from '@ai-sdk/mistral';
import { createMistral } from '@ai-sdk/mistral';

export function getAnthropicModel(apiKey: string, model: string) {
  const anthropic = createAnthropic({
    apiKey,
  });

  return anthropic(model);
}
export function getOpenAILikeModel(baseURL:string,apiKey: string, model: string) {
  const openai = createOpenAI({
    baseURL,
    apiKey,
  });

  return openai(model);
}
export function getOpenAIModel(apiKey: string, model: string) {
  const openai = createOpenAI({
    apiKey,
  });

  return openai(model);
}

export function getMistralModel(apiKey: string, model: string) {
  const mistral = createMistral({
    apiKey
  });

  return mistral(model);
}

export function getGoogleModel(apiKey: string, model: string) {
  const google = createGoogleGenerativeAI(
    apiKey,
  );

  return google(model);
}

export function getGroqModel(apiKey: string, model: string) {
  const openai = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey,
  });

  return openai(model);
}

export function getOllamaModel(baseURL: string, model: string) {
  let Ollama = ollama(model, {
    numCtx: 32768,
  });

  Ollama.config.baseURL = `${baseURL}/api`;
  return Ollama;
}

export function getDeepseekModel(apiKey: string, model: string){
  const openai = createOpenAI({
    baseURL: 'https://api.deepseek.com/beta',
    apiKey,
  });

  return openai(model);
}

export function getOpenRouterModel(apiKey: string, model: string) {
  const openRouter = createOpenRouter({
    apiKey
  });

  return openRouter.chat(model);
}

export function getXAIModel(apiKey: string, model: string) {
  const openai = createOpenAI({
    baseURL: 'https://api.x.ai/v1',
    apiKey,
  });

  return openai(model);
}

export function getModel(provider: string, model: string, env: Env) {
  const apiKey = getAPIKey(env, provider);
  const baseURL = getBaseURL(env, provider);

  switch (provider) {
    case 'Anthropic':
      return getAnthropicModel(apiKey, model);
    case 'OpenAI':
      return getOpenAIModel(apiKey, model);
    case 'Groq':
      return getGroqModel(apiKey, model);
    case 'OpenRouter':
      return getOpenRouterModel(apiKey, model);
    case 'Google':
      return getGoogleModel(apiKey, model)
    case 'OpenAILike':
      return getOpenAILikeModel(baseURL,apiKey, model);
    case 'Deepseek':
      return getDeepseekModel(apiKey, model)
    case 'Mistral':
      return  getMistralModel(apiKey, model);
    case 'xAI':
      return getXAIModel(apiKey, model);
    default:
      return getOllamaModel(baseURL, model);
  }
}
