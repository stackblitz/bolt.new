import { map } from 'nanostores';
import { workbenchStore } from './workbench';

export interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  ctrlOrMetaKey?: boolean;
  action: () => void;
}

export interface Shortcuts {
  toggleTerminal: Shortcut;
}

export interface Provider {
  name: string;
  isEnabled: boolean;
}

export interface Settings {
  shortcuts: Shortcuts;
  providers: Provider[];
}

export const providersList: Provider[] = [
  { name: 'Groq', isEnabled: false },
  { name: 'HuggingFace', isEnabled: false },
  { name: 'OpenAI', isEnabled: false },
  { name: 'Anthropic', isEnabled: false },
  { name: 'OpenRouter', isEnabled: false },
  { name: 'Google', isEnabled: false },
  { name: 'Ollama', isEnabled: false },
  { name: 'OpenAILike', isEnabled: false },
  { name: 'Together', isEnabled: false },
  { name: 'Deepseek', isEnabled: false },
  { name: 'Mistral', isEnabled: false },
  { name: 'Cohere', isEnabled: false },
  { name: 'LMStudio', isEnabled: false },
  { name: 'xAI', isEnabled: false },
];

export const shortcutsStore = map<Shortcuts>({
  toggleTerminal: {
    key: 'j',
    ctrlOrMetaKey: true,
    action: () => workbenchStore.toggleTerminal(),
  },
});

export const settingsStore = map<Settings>({
  shortcuts: shortcutsStore.get(),
  providers: providersList,
});

shortcutsStore.subscribe((shortcuts) => {
  settingsStore.set({
    ...settingsStore.get(),
    shortcuts,
  });
});
