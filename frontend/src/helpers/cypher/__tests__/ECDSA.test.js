import { vi, describe, test, expect, afterEach, beforeEach } from 'vitest';

// Mock subtle crypto to return a deterministic signature
const fakeSignature = new Uint8Array([1,2,3,4,5,6,7,8]).buffer; // even length

beforeEach(() => {
  vi.stubGlobal('crypto', {
    subtle: {
      importKey: vi.fn(async () => ({ dummy: true })),
      sign: vi.fn(async () => fakeSignature)
    }
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

import { signMessage } from '../ECDSA';

describe('ECDSA.signMessage', () => {
  test('returns a base64 signature string', async () => {
    const pem = '-----BEGIN PRIVATE KEY-----\n' + (typeof btoa === 'function' ? btoa('abcd') : Buffer.from('abcd').toString('base64')) + '\n-----END PRIVATE KEY-----';
    const sig = await signMessage('hello', pem);
    expect(typeof sig).toBe('string');
    expect(sig.length).toBeGreaterThan(0);
  });
});
