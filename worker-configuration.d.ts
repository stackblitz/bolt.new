interface Env {
  ANTHROPIC_API_KEY: string;
  GROQ_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  AI_PROVIDER?: 'groq' | 'openrouter';
  GROQ_MODEL?: string;
  OPENROUTER_MODEL?: string;
}
