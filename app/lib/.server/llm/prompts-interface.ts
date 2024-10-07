export interface Prompts {
    getSystemPrompt(cwd?: string): string;
    getContinuePrompt(): string;
}