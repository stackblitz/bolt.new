import type { ModelInfo } from '~/utils/types';

export type ProviderInfo = {
  staticModels: ModelInfo[];
  name: string;
  getDynamicModels?: (apiKeys?: Record<string, string>, providerSettings?: IProviderSetting) => Promise<ModelInfo[]>;
  getApiKeyLink?: string;
  labelForGetApiKey?: string;
  icon?: string;
};

export interface IProviderSetting {
  enabled?: boolean;
  baseUrl?: string;
}

export type IProviderConfig = ProviderInfo & {
  settings: IProviderSetting;
};
