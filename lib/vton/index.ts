import { DecartVTONProvider } from './decart-adapter';
import { MockVTONProvider } from './mock-adapter';
import { BaseVTONProvider, IVTONProvider } from './provider';

export * from './types';
export * from './provider';
export * from './state-machine';
export * from './mock-adapter';
export * from './decart-adapter';

export function createVTONProvider(preferLive = false): IVTONProvider {
  if (preferLive) {
    return new DecartVTONProvider();
  }

  // Default to reliable, high-fidelity Mock adapter for demo/testing
  return new MockVTONProvider();
}
