import { createAnthropic } from '@ai-sdk/anthropic';
export function getAnthropicModel(apiKey: string, baseURL: string) {
  console.log('baseURL', baseURL);
  const anthropic = createAnthropic({
    apiKey,
    baseURL,
  });

  return anthropic('claude-3-5-sonnet-20240620');
}
