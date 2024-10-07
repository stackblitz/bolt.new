import { getCurrentLLMType, selectLLM } from './llm-selector';
import type { Messages }from './llm-interface';

export function streamText(messages: Messages, env: Env, options?: any) {
  const llm = selectLLM(getCurrentLLMType()); 
  return llm.streamText(messages, env, options);
}
