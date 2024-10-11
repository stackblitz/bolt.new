import { createAnthropic } from '@ai-sdk/anthropic';
import { env } from 'node:process';
export function getAnthropicModel(apiKey: string) {
  const baseURL = env.ANTHROPIC_BASE_URL;
  const anthropic = createAnthropic({
    apiKey,
    baseURL,
  });

  return anthropic('claude-3-5-sonnet-20240620');
}
