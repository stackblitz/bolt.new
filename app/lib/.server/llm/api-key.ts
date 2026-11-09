import { env as nodeEnv } from 'node:process';

export type AIProvider = 'gemini' | 'groq' | 'openrouter';

export interface AIEnvironment {
  AI_PROVIDER?: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
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

export function getAIConfig(cloudflareEnv?: AIEnvironment, providerOverride?: AIProvider): AIConfig {
  const configuredProvider = readEnvironmentVariable('AI_PROVIDER', cloudflareEnv)?.toLowerCase();

  const provider: AIProvider = providerOverride || (configuredProvider
    ? configuredProvider as AIProvider
    : 'gemini');

  if (!['gemini', 'groq', 'openrouter'].includes(provider)) {
    throw new Error('AI_PROVIDER must be one of "gemini", "groq", or "openrouter".');
  }

  const providerConfig = {
    gemini: {
      apiKey: readEnvironmentVariable('GEMINI_API_KEY', cloudflareEnv),
      model: readEnvironmentVariable('GEMINI_MODEL', cloudflareEnv) || 'gemini-3.8-flash',
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      requiredKey: 'GEMINI_API_KEY',
    },
    groq: {
      apiKey: readEnvironmentVariable('GROQ_API_KEY', cloudflareEnv),
      model: readEnvironmentVariable('GROQ_MODEL', cloudflareEnv) || 'openai/gpt-oss-120b',
      baseURL: 'https://api.groq.com/openai/v1',
      requiredKey: 'GROQ_API_KEY',
    },
    openrouter: {
      apiKey: readEnvironmentVariable('OPENROUTER_API_KEY', cloudflareEnv),
      model: readEnvironmentVariable('OPENROUTER_MODEL', cloudflareEnv) || 'deepseek/deepseek-v4.1-flash',
      baseURL: 'https://openrouter.ai/api/v1',
      requiredKey: 'OPENROUTER_API_KEY',
    },
  }[provider];

  if (!providerConfig.apiKey) {
    throw new Error(
      `${providerConfig.requiredKey} is not configured on the server. Add it to the Vercel Preview and Production environment variables.`,
    );
  }

  return {
    provider,
    apiKey: providerConfig.apiKey,
    model: providerConfig.model,
    baseURL: providerConfig.baseURL,
  };
}
