import { MODIFICATIONS_TAG_NAME, WORK_DIR } from '~/utils/constants';
import { allowedHTMLElements } from '~/utils/markdown';
import { stripIndents } from '~/utils/stripIndent';
import type { Prompts } from './prompts-interface';
import { getCurrentLLMType } from './llm-selector';
import { AnthropicPrompts } from './anthropic-prompts';
import { OpenAIPrompts } from './openai-prompts';

class GenericPrompts implements Prompts {
  getSystemPrompt(cwd: string = WORK_DIR): string {
    return `
    You are an AI assistant. Please help the user with their task.
    The current working directory is ${cwd}.
    `;
  }

  getContinuePrompt(): string {
    return stripIndents`
      Continue your prior response. Please begin from where you left off without any interruptions.
    `;
  }
}

export function getPrompts(): Prompts {
  const llmType = getCurrentLLMType();
  switch (llmType) {
    case 'anthropic':
      return new AnthropicPrompts();
    case 'openai':
      return new OpenAIPrompts();
    default:
      return new GenericPrompts();
  }
}

export function getSystemPrompt(cwd: string = WORK_DIR): string {
  return getPrompts().getSystemPrompt(cwd);
}

export function getContinuePrompt(): string {
  return getPrompts().getContinuePrompt();
}
