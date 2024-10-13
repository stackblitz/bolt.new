import { createAnthropic } from '@ai-sdk/anthropic';
import { getAPIKey } from '~/lib/.server/llm/api-key';
import { env } from 'node:process';

export function getAnthropicModel(env: Env) {
  const anthropic = createAnthropic({
    apiKey: getAPIKey(env),
    baseURL: getBaseUrl(env) 
  });
  return anthropic(getModel(env));
}

export function getBaseUrl(cloudflareEnv: Env) {
  /**
   * The `cloudflareEnv` is only used when deployed or when previewing locally.
   * In development the environment variables are available through `env`.
   */
  return env.ANTHROPIC_BASE_URL || cloudflareEnv.ANTHROPIC_BASE_URL;
}


export function getModel(cloudflareEnv: Env) {
  /**
   * The `cloudflareEnv` is only used when deployed or when previewing locally.
   * In development the environment variables are available through `env`.
   */
  return env.ANTHROPIC_MODEL || cloudflareEnv.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620';
}
