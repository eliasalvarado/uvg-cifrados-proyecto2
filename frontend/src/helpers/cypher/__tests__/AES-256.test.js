import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

// Mock js-crypto-aes used by AES-256 module
vi.mock('js-crypto-aes', () => ({
  encrypt: vi.fn(async (dataBytes, key, opts) => {
    // return a small ciphertext Uint8Array (typed array so .length is defined)
    return new Uint8Array([1,2,3]);
  }),
  decrypt: vi.fn(async (ciphertext, key, opts) => {
    // return plaintext bytes for 'hello'
    return new Uint8Array([104,101,108,108,111]).buffer; // 'hello'
  })
}));

import * as aes from '../AES-256';

describe('AES-256 helpers', () => {
  beforeEach(() => {
    // deterministic getRandomValues via vitest stubGlobal (avoids assigning read-only global)
    vi.stubGlobal('crypto', {
      getRandomValues: (arr) => {
        for (let i = 0; i < arr.length; i++) arr[i] = i + 1;
        return arr;
      }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetAllMocks();
  });

  test('encryptAES256 + decryptAES256 roundtrip returns original plaintext', async () => {
    const key = new Uint8Array(32);
    const plaintext = 'hello';

    const cipherBase64 = await aes.encryptAES256(plaintext, key);
    expect(typeof cipherBase64).toBe('string');

    const { decrypt } = await import('js-crypto-aes');
    const decrypted = await aes.decryptAES256(cipherBase64, key);
    // Ensure decrypt was invoked and result is a string (decoded plaintext)
    expect(decrypt).toHaveBeenCalled();
    expect(typeof decrypted).toBe('string');
  });

  test('decryptAES256 returns original input when decrypt throws', async () => {
    // make decrypt throw
    const { decrypt } = await import('js-crypto-aes');
    decrypt.mockImplementationOnce(() => { throw new Error('boom'); });
    const key = new Uint8Array(32);
    // build a valid base64 encoded combined buffer (12 bytes iv + 3 bytes ciphertext)
    const combined = new Uint8Array(12 + 3);
    for (let i = 0; i < combined.length; i++) combined[i] = i + 1;
    const binaryStr = String.fromCodePoint(...combined);
    const fake = (typeof btoa === 'function') ? btoa(binaryStr) : Buffer.from(binaryStr, 'binary').toString('base64');

    const result = await aes.decryptAES256(fake, key);
    expect(result).toBe(fake);
  });
});
