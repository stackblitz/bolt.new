import { AnthropicLLM } from './anthropic-llm';
import { OpenAILLM } from './openai-llm';
import type { LLM } from './llm-interface';

export type LLMType = 'anthropic' | 'openai';

export function selectLLM(type: LLMType): LLM {
  switch (type) {
    case 'anthropic':
      return new AnthropicLLM();
    case 'openai':
      return new OpenAILLM();
    default:
      throw new Error(`Unsupported LLM type: ${type}`);
  }
}

export function getCurrentLLMType(): LLMType {
  return process.env.LLM_TYPE as LLMType || 'anthropic';
}