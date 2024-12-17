import { env } from 'node:process';
import type { Provider } from '~/lib/stores/provider';

export function getAPIKey(cloudflareEnv: Env, provider: Provider) {
  if (provider === 'anthropic') {
    return env.ANTHROPIC_API_KEY || cloudflareEnv.ANTHROPIC_API_KEY;
  } else {
    return env.TOGETHER_API_KEY || cloudflareEnv.TOGETHER_API_KEY;
  }
}
