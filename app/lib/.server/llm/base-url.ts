import { env } from 'node:process';
export function getBaseURL(cloudflareEnv: Env) {
  return env.ANTHROPIC_BASE_URL || cloudflareEnv.ANTHROPIC_BASE_URL;
}
