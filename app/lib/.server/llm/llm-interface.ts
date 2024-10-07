import { streamText as _streamText } from 'ai';
import type { Prompts } from './prompts-interface';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }
  
export type Messages = Message[];

export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model'>;

export interface LLM {
  streamText(messages: Messages, env: Env, options?: StreamingOptions): Promise<any>;
  getPrompts(): Prompts;
}