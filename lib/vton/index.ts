import { DecartVTONProvider } from './decart-adapter';
import { MockVTONProvider } from './mock-adapter';
import { BaseVTONProvider, IVTONProvider } from './provider';

export * from './types';
export * from './provider';
export * from './state-machine';
export * from './mock-adapter';
export * from './decart-adapter';

export function createVTONProvider(preferLive = false): IVTONProvider {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const hasDecartKey = Boolean(process.env.NEXT_PUBLIC_DECART_API_KEY);

  if (!isDemo && hasDecartKey && preferLive) {
    return new DecartVTONProvider({
      apiKey: process.env.NEXT_PUBLIC_DECART_API_KEY,
    });
  }

  // Default to reliable, high-fidelity Mock adapter for demo/testing
  return new MockVTONProvider();
}
