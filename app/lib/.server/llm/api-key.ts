import { env } from 'node:process';

export function getAPIKey(cloudflareEnv: Env) {
  /**
   * The `cloudflareEnv` is only used when deployed or when previewing locally.
   * In development the environment variables are available through `env`.
   */
  const provider = cloudflareEnv.PROVIDER || 'anthropic';

  if (provider === 'gemini') {
    return cloudflareEnv.GOOGLE_GENERATIVE_AI_API_KEY || (env.GOOGLE_GENERATIVE_AI_API_KEY as string);
  }

  if (provider === 'openai') {
    return cloudflareEnv.OPEN_AI_API_KEY || (env.OPEN_AI_API_KEY as string);
  }

  return env.ANTHROPIC_API_KEY || cloudflareEnv.ANTHROPIC_API_KEY;
}
