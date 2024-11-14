import type { ModelInfo, OllamaApiResponse, OllamaModel } from './types';
import type { ProviderInfo } from '~/types/model';

export const WORK_DIR_NAME = 'project';
export const WORK_DIR = `/home/${WORK_DIR_NAME}`;
export const MODIFICATIONS_TAG_NAME = 'bolt_file_modifications';
export const MODEL_REGEX = /^\[Model: (.*?)\]\n\n/;
export const PROVIDER_REGEX = /\[Provider: (.*?)\]\n\n/;
export const DEFAULT_MODEL = 'claude-3-5-sonnet-latest';

const PROVIDER_LIST: ProviderInfo[] = [
  {
    name: 'Anthropic',
    staticModels: [
      { name: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet (new)', provider: 'Anthropic' },
      { name: 'claude-3-5-sonnet-20240620', label: 'Claude 3.5 Sonnet (old)', provider: 'Anthropic' },
      { name: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku (new)', provider: 'Anthropic' },
      { name: 'claude-3-opus-latest', label: 'Claude 3 Opus', provider: 'Anthropic' },
      { name: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet', provider: 'Anthropic' },
      { name: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku', provider: 'Anthropic' }
    ],
    getApiKeyLink: "https://console.anthropic.com/settings/keys",
  },
  {
    name: 'Ollama',
    staticModels: [],
    getDynamicModels: getOllamaModels,
    getApiKeyLink: "https://ollama.com/download",
    labelForGetApiKey: "Download Ollama",
    icon: "i-ph:cloud-arrow-down",
  }, {
    name: 'OpenAILike',
    staticModels: [],
    getDynamicModels: getOpenAILikeModels
  },
  {
    name: 'OpenRouter',
    staticModels: [
      { name: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI' },
      {
        name: 'anthropic/claude-3.5-sonnet',
        label: 'Anthropic: Claude 3.5 Sonnet (OpenRouter)',
        provider: 'OpenRouter'
      },
      { name: 'anthropic/claude-3-haiku', label: 'Anthropic: Claude 3 Haiku (OpenRouter)', provider: 'OpenRouter' },
      { name: 'deepseek/deepseek-coder', label: 'Deepseek-Coder V2 236B (OpenRouter)', provider: 'OpenRouter' },
      { name: 'google/gemini-flash-1.5', label: 'Google Gemini Flash 1.5 (OpenRouter)', provider: 'OpenRouter' },
      { name: 'google/gemini-pro-1.5', label: 'Google Gemini Pro 1.5 (OpenRouter)', provider: 'OpenRouter' },
      { name: 'x-ai/grok-beta', label: 'xAI Grok Beta (OpenRouter)', provider: 'OpenRouter' },
      { name: 'mistralai/mistral-nemo', label: 'OpenRouter Mistral Nemo (OpenRouter)', provider: 'OpenRouter' },
      { name: 'qwen/qwen-110b-chat', label: 'OpenRouter Qwen 110b Chat (OpenRouter)', provider: 'OpenRouter' },
      { name: 'cohere/command', label: 'Cohere Command (OpenRouter)', provider: 'OpenRouter' }
    ],
    getDynamicModels: getOpenRouterModels,
    getApiKeyLink: 'https://openrouter.ai/settings/keys',

  }, {
    name: 'Google',
    staticModels: [
      { name: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash', provider: 'Google' },
      { name: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro', provider: 'Google' }
    ],
    getApiKeyLink: 'https://aistudio.google.com/app/apikey'
  }, {
    name: 'Groq',
    staticModels: [
      { name: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70b (Groq)', provider: 'Groq' },
      { name: 'llama-3.1-8b-instant', label: 'Llama 3.1 8b (Groq)', provider: 'Groq' },
      { name: 'llama-3.2-11b-vision-preview', label: 'Llama 3.2 11b (Groq)', provider: 'Groq' },
      { name: 'llama-3.2-3b-preview', label: 'Llama 3.2 3b (Groq)', provider: 'Groq' },
      { name: 'llama-3.2-1b-preview', label: 'Llama 3.2 1b (Groq)', provider: 'Groq' }
    ],
    getApiKeyLink: 'https://console.groq.com/keys'
  }, {
    name: 'OpenAI',
    staticModels: [
      { name: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI' },
      { name: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'OpenAI' },
      { name: 'gpt-4', label: 'GPT-4', provider: 'OpenAI' },
      { name: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI' }
    ],
    getApiKeyLink: "https://platform.openai.com/api-keys",
  }, {
    name: 'xAI',
    staticModels: [
      { name: 'grok-beta', label: 'xAI Grok Beta', provider: 'xAI' }
    ],
    getApiKeyLink: 'https://docs.x.ai/docs/quickstart#creating-an-api-key'
  }, {
    name: 'Deepseek',
    staticModels: [
      { name: 'deepseek-coder', label: 'Deepseek-Coder', provider: 'Deepseek' },
      { name: 'deepseek-chat', label: 'Deepseek-Chat', provider: 'Deepseek' }
    ],
    getApiKeyLink: 'https://platform.deepseek.com/api_keys'
  }, {
    name: 'Mistral',
    staticModels: [
      { name: 'open-mistral-7b', label: 'Mistral 7B', provider: 'Mistral' },
      { name: 'open-mixtral-8x7b', label: 'Mistral 8x7B', provider: 'Mistral' },
      { name: 'open-mixtral-8x22b', label: 'Mistral 8x22B', provider: 'Mistral' },
      { name: 'open-codestral-mamba', label: 'Codestral Mamba', provider: 'Mistral' },
      { name: 'open-mistral-nemo', label: 'Mistral Nemo', provider: 'Mistral' },
      { name: 'ministral-8b-latest', label: 'Mistral 8B', provider: 'Mistral' },
      { name: 'mistral-small-latest', label: 'Mistral Small', provider: 'Mistral' },
      { name: 'codestral-latest', label: 'Codestral', provider: 'Mistral' },
      { name: 'mistral-large-latest', label: 'Mistral Large Latest', provider: 'Mistral' }
    ],
    getApiKeyLink: 'https://console.mistral.ai/api-keys/'
  }, {
    name: 'LMStudio',
    staticModels: [],
    getDynamicModels: getLMStudioModels,
    getApiKeyLink: 'https://lmstudio.ai/',
    labelForGetApiKey: 'Get LMStudio',
    icon: "i-ph:cloud-arrow-down",
  }
];

export const DEFAULT_PROVIDER = PROVIDER_LIST[0];

const staticModels: ModelInfo[] = PROVIDER_LIST.map(p => p.staticModels).flat();

export let MODEL_LIST: ModelInfo[] = [...staticModels];

const getOllamaBaseUrl = () => {
  const defaultBaseUrl = import.meta.env.OLLAMA_API_BASE_URL || 'http://localhost:11434';
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Frontend always uses localhost
    return defaultBaseUrl;
  }

  // Backend: Check if we're running in Docker
  const isDocker = process.env.RUNNING_IN_DOCKER === 'true';

  return isDocker
    ? defaultBaseUrl.replace('localhost', 'host.docker.internal')
    : defaultBaseUrl;
};

async function getOllamaModels(): Promise<ModelInfo[]> {
  try {
    const base_url = getOllamaBaseUrl();
    const response = await fetch(`${base_url}/api/tags`);
    const data = await response.json() as OllamaApiResponse;

    return data.models.map((model: OllamaModel) => ({
      name: model.name,
      label: `${model.name} (${model.details.parameter_size})`,
      provider: 'Ollama'
    }));
  } catch (e) {
    return [];
  }
}

async function getOpenAILikeModels(): Promise<ModelInfo[]> {
  try {
    const base_url = import.meta.env.OPENAI_LIKE_API_BASE_URL || '';
    if (!base_url) {
      return [];
    }
    const api_key = import.meta.env.OPENAI_LIKE_API_KEY ?? '';
    const response = await fetch(`${base_url}/models`, {
      headers: {
        Authorization: `Bearer ${api_key}`
      }
    });
    const res = await response.json() as any;
    return res.data.map((model: any) => ({
      name: model.id,
      label: model.id,
      provider: 'OpenAILike'
    }));
  } catch (e) {
    return [];
  }
}

type OpenRouterModelsResponse = {
  data: {
    name: string;
    id: string;
    context_length: number;
    pricing: {
      prompt: number;
      completion: number;
    }
  }[]
};

async function getOpenRouterModels(): Promise<ModelInfo[]> {
  const data: OpenRouterModelsResponse = await (await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      'Content-Type': 'application/json'
    }
  })).json();

  return data.data.sort((a, b) => a.name.localeCompare(b.name)).map(m => ({
    name: m.id,
    label: `${m.name} - in:$${(m.pricing.prompt * 1_000_000).toFixed(
      2)} out:$${(m.pricing.completion * 1_000_000).toFixed(2)} - context ${Math.floor(
      m.context_length / 1000)}k`,
    provider: 'OpenRouter'
  }));
}

async function getLMStudioModels(): Promise<ModelInfo[]> {
  try {
    const base_url = import.meta.env.LMSTUDIO_API_BASE_URL || 'http://localhost:1234';
    const response = await fetch(`${base_url}/v1/models`);
    const data = await response.json() as any;
    return data.data.map((model: any) => ({
      name: model.id,
      label: model.id,
      provider: 'LMStudio'
    }));
  } catch (e) {
    return [];
  }
}



async function initializeModelList(): Promise<ModelInfo[]> {
  MODEL_LIST = [...(await Promise.all(
    PROVIDER_LIST
      .filter((p): p is ProviderInfo & { getDynamicModels: () => Promise<ModelInfo[]> } => !!p.getDynamicModels)
      .map(p => p.getDynamicModels())))
    .flat(), ...staticModels];
  return MODEL_LIST;
}

export { getOllamaModels, getOpenAILikeModels, getLMStudioModels, initializeModelList, getOpenRouterModels, PROVIDER_LIST };
