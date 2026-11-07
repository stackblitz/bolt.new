import { env as nodeEnv } from 'node:process';

export type AIProvider = 'groq' | 'openrouter';

export interface AIEnvironment {
  AI_PROVIDER?: string;
  GROQ_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  GROQ_MODEL?: string;
  OPENROUTER_MODEL?: string;
}

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseURL: string;
}

function readEnvironmentVariable(name: keyof AIEnvironment, cloudflareEnv?: AIEnvironment) {
  return nodeEnv[name] || cloudflareEnv?.[name];
}

export function getAIConfig(cloudflareEnv?: AIEnvironment): AIConfig {
  const groqApiKey = readEnvironmentVariable('GROQ_API_KEY', cloudflareEnv);
  const openRouterApiKey = readEnvironmentVariable('OPENROUTER_API_KEY', cloudflareEnv);
  const configuredProvider = readEnvironmentVariable('AI_PROVIDER', cloudflareEnv)?.toLowerCase();

  // Prefer Groq when both keys are present; OpenRouter works automatically when it is the only key.
  const provider: AIProvider =
    configuredProvider === 'openrouter' || (!configuredProvider && !groqApiKey && openRouterApiKey)
      ? 'openrouter'
      : 'groq';

  if (configuredProvider && configuredProvider !== 'groq' && configuredProvider !== 'openrouter') {
    throw new Error('AI_PROVIDER must be either "groq" or "openrouter".');
  }

  const apiKey = provider === 'groq' ? groqApiKey : openRouterApiKey;

  if (!apiKey) {
    const requiredKey = provider === 'groq' ? 'GROQ_API_KEY' : 'OPENROUTER_API_KEY';
    throw new Error(`${requiredKey} is not configured on the server.`);
  }

  return {
    provider,
    apiKey,
    model:
      readEnvironmentVariable(provider === 'groq' ? 'GROQ_MODEL' : 'OPENROUTER_MODEL', cloudflareEnv) ||
      (provider === 'groq' ? 'llama-3.3-70b-versatile' : 'deepseek/deepseek-v4.1-flash-1017'),
    baseURL:
      provider === 'groq' ? 'https://api.groq.com/openai/v1' : 'https://openrouter.ai/api/v1',
  };
}
