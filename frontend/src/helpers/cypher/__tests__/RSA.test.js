import { vi, describe, test, expect } from 'vitest';

// Mock node-forge to avoid heavy crypto operations
vi.mock('node-forge', () => ({
  default: {
    pki: {
      publicKeyFromPem: () => ({ encrypt: () => 'encrypted-binary' }),
      privateKeyFromPem: () => ({ decrypt: () => 'decrypted-binary' })
    },
    util: {
      binary: { raw: { encode: (data) => data, decode: () => [100,101,102] } },
      encode64: (s) => 'BASE64(' + s + ')',
      decode64: (s) => s
    },
    md: { sha256: { create: () => ({}) } }
  }
}));

import { encryptRSA, decryptRSA } from '../RSA';

describe('RSA helpers', () => {
  test('encryptRSA returns base64 string', () => {
    const publicPem = '-----BEGIN PUBLIC KEY-----\nabc\n-----END PUBLIC KEY-----';
    const data = new Uint8Array([1,2,3]);
    const out = encryptRSA(data, publicPem);
    expect(typeof out).toBe('string');
    expect(out.startsWith('BASE64(')).toBe(true);
  });

  test('decryptRSA returns Uint8Array', () => {
    const privatePem = '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----';
    const res = decryptRSA('SOMEDATA', privatePem);
    expect(res).toBeInstanceOf(Uint8Array);
    expect(res.length).toBeGreaterThan(0);
  });
});
