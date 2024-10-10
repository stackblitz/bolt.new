import { atom } from 'nanostores';

export type Provider = 'anthropic' | { type: 'together', model: string };

export const providerStore = atom<Provider>('anthropic');

export function setProvider(provider: Provider) {
  providerStore.set(provider);
}