import { setHealthy, isHealthy } from '../blockchainHealth.js';

describe('blockchainHealth', () => {
  beforeEach(() => {
    // reset to healthy true by default
    setHealthy(true);
  });

  test('default is healthy', () => {
    expect(isHealthy()).toBe(true);
  });

  test('setHealthy(false) updates state', () => {
    setHealthy(false);
    expect(isHealthy()).toBe(false);
  });
});
