import { useStore } from '@nanostores/react';
import {
  isDebugMode,
  isLocalModelsEnabled,
  LOCAL_PROVIDERS,
  providersStore,
  type IProviderSetting,
} from '~/lib/stores/settings';
import { useCallback, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import type { ProviderInfo } from '~/utils/types';

export function useSettings() {
  const providers = useStore(providersStore);
  const debug = useStore(isDebugMode);
  const isLocalModel = useStore(isLocalModelsEnabled);
  const [activeProviders, setActiveProviders] = useState<ProviderInfo[]>([]);

  // reading values from cookies on mount
  useEffect(() => {
    const savedProviders = Cookies.get('providers');

    if (savedProviders) {
      try {
        const parsedProviders: Record<string, IProviderSetting> = JSON.parse(savedProviders);
        Object.keys(parsedProviders).forEach((provider) => {
          const currentProvider = providers[provider];
          providersStore.setKey(provider, {
            ...currentProvider,
            settings: {
              ...parsedProviders[provider],
              enabled: parsedProviders[provider].enabled || true,
            },
          });
        });
      } catch (error) {
        console.error('Failed to parse providers from cookies:', error);
      }
    }

    // load debug mode from cookies
    const savedDebugMode = Cookies.get('isDebugEnabled');

    if (savedDebugMode) {
      isDebugMode.set(savedDebugMode === 'true');
    }

    // load local models from cookies
    const savedLocalModels = Cookies.get('isLocalModelsEnabled');

    if (savedLocalModels) {
      isLocalModelsEnabled.set(savedLocalModels === 'true');
    }
  }, []);

  // writing values to cookies on change
  useEffect(() => {
    const providers = providersStore.get();
    const providerSetting: Record<string, IProviderSetting> = {};
    Object.keys(providers).forEach((provider) => {
      providerSetting[provider] = providers[provider].settings;
    });
    Cookies.set('providers', JSON.stringify(providerSetting));
  }, [providers]);

  useEffect(() => {
    let active = Object.entries(providers)
      .filter(([_key, provider]) => provider.settings.enabled)
      .map(([_k, p]) => p);

    if (!isLocalModel) {
      active = active.filter((p) => !LOCAL_PROVIDERS.includes(p.name));
    }

    setActiveProviders(active);
  }, [providers, isLocalModel]);

  // helper function to update settings
  const updateProviderSettings = useCallback((provider: string, config: IProviderSetting) => {
    const settings = providers[provider].settings;
    providersStore.setKey(provider, { ...providers[provider], settings: { ...settings, ...config } });
  }, []);

  const enableDebugMode = useCallback((enabled: boolean) => {
    isDebugMode.set(enabled);
    Cookies.set('isDebugEnabled', String(enabled));
  }, []);

  const enableLocalModels = useCallback((enabled: boolean) => {
    isLocalModelsEnabled.set(enabled);
    Cookies.set('isLocalModelsEnabled', String(enabled));
  }, []);

  return {
    providers,
    activeProviders,
    updateProviderSettings,
    debug,
    enableDebugMode,
    isLocalModel,
    enableLocalModels,
  };
}
