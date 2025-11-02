import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

vi.mock('../AES-256', () => ({
  generateAES256Key: vi.fn(() => new Uint8Array(32)),
  encryptAES256: vi.fn(async (text, key) => 'cipher-text'),
  decryptAES256: vi.fn(async (textEncrypted, key) => 'plain-text')
}));

vi.mock('../RSA', () => ({
  encryptRSA: vi.fn(async (key, pub) => 'key-encrypted'),
  decryptRSA: vi.fn((cipher, priv) => new Uint8Array([1,2,3,4]))
}));

import { encryptAESRSA, decryptAESRSA } from '../AES_RSA';

describe('AES_RSA', () => {
  test('encryptAESRSA returns expected fields', async () => {
    const res = await encryptAESRSA('hello', 'pubA', 'pubB');
    expect(res).toHaveProperty('textEncrypted', 'cipher-text');
    expect(res).toHaveProperty('targetKeyEncrypted', 'key-encrypted');
    expect(res).toHaveProperty('originKeyEncrypted', 'key-encrypted');
  });

  test('decryptAESRSA returns decrypted text on success', async () => {
    const txt = await decryptAESRSA('cipher', 'someKey', 'priv');
    expect(txt).toBe('plain-text');
  });

  test('decryptAESRSA returns input when error occurs', async () => {
    const { decryptRSA } = await import('../RSA');
    decryptRSA.mockImplementationOnce(() => { throw new Error('boom'); });
    const txt = await decryptAESRSA('cipher', 'someKey', 'priv');
    expect(txt).toBe('cipher');
  });
});
