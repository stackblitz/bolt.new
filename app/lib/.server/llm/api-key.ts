import { env } from 'node:process';

export function getAPIKey(cloudflareEnv?: Env) {
  /**
   * Cloudflare bindings are available when deployed or previewing locally.
   * On Node/Vercel, the key is supplied through the server environment.
   */
  const apiKey = env.ANTHROPIC_API_KEY || cloudflareEnv?.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured on the server.');
  }

  return apiKey;
}
