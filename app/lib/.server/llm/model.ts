import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';

export function getAnthropicModel(apiKey: string, baseURL: string) {
  console.log('baseURL', baseURL);
  const anthropic = createAnthropic({
    apiKey,
    baseURL,
  });

  return anthropic('claude-3-5-sonnet-20240620');
}

export function getOpenAIModel(apiKey: string, baseURL: string) {
  console.log('OpenAI baseURL', baseURL);
  const openai = createOpenAI({
    apiKey,
    baseURL,
  });

  // return openai('gpt-4-turbo-preview');
  return openai('claude-3-5-sonnet-20240620');
}
