export const WORK_DIR_NAME = 'project';
export const WORK_DIR = `/home/${WORK_DIR_NAME}`;
export const MODIFICATIONS_TAG_NAME = 'bolt_file_modifications';
export const MODEL_REGEX = /^\[Model: (.*?)\]\n\n/;
export const DEFAULT_MODEL = "claude-3-5-sonnet-20240620";
export const DEFAULT_PROVIDER = "Anthropic";
export const MODEL_LIST = [
    { name: 'claude-3-5-sonnet-20240620', label: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
    { name: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash', provider: 'Google' },
    { name: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro', provider: 'Google'},
    { name: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI' },
    { name: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI' },
    { name: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'OpenAI' },
    { name: 'gpt-4', label: 'GPT-4', provider: 'OpenAI' },
    { name: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI' },
    { name: 'qwen2.5-coder:7b', label: 'Qwen 2.5 Coder 7b', provider: 'Ollama' },
    { name: 'qwen2.5-coder:1.5b', label: 'Qwen 2.5 Coder 1.5b', provider: 'Ollama' },
    { name: 'deepseek-coder-v2:236b', label: 'DeepSeek-Coder-V2 236b', provider: 'Ollama' },
    { name: 'deepseek-coder-v2:16b', label: 'DeepSeek-Coder-V2 16b', provider: 'Ollama' },
    { name: 'codebooga', label: 'Codebooga 34b', provider: 'Ollama' },
    { name: 'phind-codellama', label: 'Phind CodeLlama 34b', provider: 'Ollama' },
    { name: 'codellama:70b', label: 'Code Llama 70b', provider: 'Ollama' },
    { name: 'codellama:34b', label: 'Code Llama 34b', provider: 'Ollama' },
    { name: 'codellama:13b', label: 'Code Llama 13b', provider: 'Ollama' },
    { name: 'codellama:7b', label: 'Code Llama 7b', provider: 'Ollama' },
    { name: 'deepseek/deepseek-coder', label: 'Deepseek-Coder V2 236B (OpenRouter)', provider: 'OpenRouter' },
    { name: 'google/gemini-flash-1.5', label: 'Google Gemini Flash 1.5 (OpenRouter)', provider: 'OpenRouter' },
    { name: 'google/gemini-pro-1.5', label: 'Google Gemini Pro 1.5 (OpenRouter)', provider: 'OpenRouter' },
    { name: 'mistralai/mistral-nemo', label: 'OpenRouter Mistral Nemo (OpenRouter)', provider: 'OpenRouter' },
    { name: 'qwen/qwen-110b-chat', label: 'OpenRouter Qwen 110b Chat (OpenRouter)', provider: 'OpenRouter' },
    { name: 'cohere/command', label: 'Cohere Command (OpenRouter)', provider: 'OpenRouter' },
    { name: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70b (Groq)', provider: 'Groq' },
    { name: 'llama-3.1-8b-instant', label: 'Llama 3.1 8b (Groq)', provider: 'Groq' },
    { name: 'llama-3.2-11b-vision-preview', label: 'Llama 3.2 11b (Groq)', provider: 'Groq' },
    { name: 'llama-3.2-3b-preview', label: 'Llama 3.2 3b (Groq)', provider: 'Groq' },
    { name: 'llama-3.2-1b-preview', label: 'Llama 3.2 1b (Groq)', provider: 'Groq' },
    { name: 'claude-3-opus-20240229', label: 'Claude 3 Opus', provider: 'Anthropic' },
    { name: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet', provider: 'Anthropic' },
    { name: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku', provider: 'Anthropic' },
];
