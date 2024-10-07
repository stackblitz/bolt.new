import { getCurrentLLMType } from './llm-selector';
import { AnthropicLLM } from './anthropic-llm';
import { OpenAILLM } from './openai-llm';
import type { LLM } from './llm-interface';

export function getModel(apiKey: string): LLM {
  const llmType = getCurrentLLMType();

  let llm: LLM;

  switch (llmType) {
    case 'anthropic':
      llm = new AnthropicLLM();
      (llm as AnthropicLLM).setApiKey(apiKey);
      break;
    case 'openai':
      llm = new OpenAILLM();
      (llm as OpenAILLM).setApiKey(apiKey);
      break;
    default:
      throw new Error(`Unsupported LLM type: ${llmType}`);
  }

  return llm;
}
