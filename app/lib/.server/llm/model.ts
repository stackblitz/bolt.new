import { createOpenAI } from '@ai-sdk/openai';
import { getAIConfig, type AIEnvironment } from './api-key';

export function getAIModel(cloudflareEnv?: AIEnvironment) {
  const config = getAIConfig(cloudflareEnv);
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

  // Both Groq and OpenRouter expose an OpenAI-compatible Chat Completions API.
  return provider.chat(config.model);
}
