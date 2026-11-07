// see https://docs.anthropic.com/en/docs/about-claude/models
// Keep individual completions within Groq's free/on-demand token-per-minute budget.
// Continuation segments let the model produce longer code without reserving a very large response at once.
export const MAX_TOKENS = 2048;

// limits the number of model responses that can be returned in a single request
export const MAX_RESPONSE_SEGMENTS = 2;
