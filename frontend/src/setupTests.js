import '@testing-library/jest-dom';
import { vi } from 'vitest';
import 'whatwg-fetch';

globalThis.jest = {
  fn: vi.fn,
  spyOn: vi.spyOn,
  clearAllMocks: () => vi.clearAllMocks(),
  resetAllMocks: () => vi.resetAllMocks(),
  restoreAllMocks: () => vi.restoreAllMocks(),
};

// ensure global fetch/atob/btoa exist in the test env (jsdom usually provides atob/btoa)
if (globalThis.fetch == 'undefined') {
  // whatwg-fetch is installed; tests that need fetch can import it or rely on setup if you add it here.
}

