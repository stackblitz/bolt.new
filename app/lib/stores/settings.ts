import { atom, map } from 'nanostores';
import { workbenchStore } from './workbench';
import type { ProviderInfo } from '~/utils/types';
import { PROVIDER_LIST } from '~/utils/constants';

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

export interface IProviderSetting {
  enabled?: boolean;
  baseUrl?: string;
}
export type IProviderConfig = ProviderInfo & {
  settings: IProviderSetting;
};

export const URL_CONFIGURABLE_PROVIDERS = ['Ollama', 'LMStudio', 'OpenAILike'];
export const LOCAL_PROVIDERS = ['OpenAILike', 'LMStudio', 'Ollama'];

export type ProviderSetting = Record<string, IProviderConfig>;

export const shortcutsStore = map<Shortcuts>({
  toggleTerminal: {
    key: 'j',
    ctrlOrMetaKey: true,
    action: () => workbenchStore.toggleTerminal(),
  },
});

const initialProviderSettings: ProviderSetting = {};
PROVIDER_LIST.forEach((provider) => {
  initialProviderSettings[provider.name] = {
    ...provider,
    settings: {
      enabled: false,
    },
  };
});
export const providersStore = map<ProviderSetting>(initialProviderSettings);

export const isDebugMode = atom(false);

export const isLocalModelsEnabled = atom(true);
