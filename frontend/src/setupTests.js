import '@testing-library/jest-dom';
import { vi } from 'vitest';
import 'whatwg-fetch';

global.jest = {
  fn: vi.fn,
  spyOn: vi.spyOn,
  clearAllMocks: () => vi.clearAllMocks(),
  resetAllMocks: () => vi.resetAllMocks(),
  restoreAllMocks: () => vi.restoreAllMocks(),
};

// ensure global fetch/atob/btoa exist in the test env (jsdom usually provides atob/btoa)
if (typeof global.fetch === 'undefined') {
  // whatwg-fetch is installed; tests that need fetch can import it or rely on setup if you add it here.
}

