import type { Provider } from '../../stores/provider';

export interface Env {
  ANTHROPIC_API_KEY: string;
  TOGETHER_API_KEY: string;
}

export function getAPIKey(env: Env, provider: Provider): string {
  if (provider === 'anthropic') {
    return env.ANTHROPIC_API_KEY;
  } else if (typeof provider === 'object' && provider.type === 'together') {
    return env.TOGETHER_API_KEY;
  }
  throw new Error(`Invalid provider: ${JSON.stringify(provider)}`);
}