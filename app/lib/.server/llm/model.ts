import { createOpenAI } from '@ai-sdk/openai';
import { getAIConfig, type AIEnvironment, type AIProvider } from './api-key';

export function getAIModel(cloudflareEnv?: AIEnvironment, providerOverride?: AIProvider) {
  const config = getAIConfig(cloudflareEnv, providerOverride);

  // Gemini's official OpenAI-compatible endpoint lets us keep the project's
  // installed AI SDK version and existing chat-completions integration.
  const provider = createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    headers:
      config.provider === 'openrouter'
        ? {
            'X-Title': 'BeamCore',
          }
        : undefined,
  });

  return provider.chat(config.model);
}
