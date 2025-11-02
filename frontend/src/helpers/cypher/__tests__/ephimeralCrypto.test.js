import { describe, test, expect } from 'vitest';
import { encryptMessage, decryptMessage } from '../ephimeralCrypto';

describe('ephimeralCrypto', () => {
  test('encrypt/decrypt roundtrip using same key', () => {
    const key = 'testkey';
    const msg = 'hola mundo';
    const encrypted = encryptMessage(msg, key);
    expect(typeof encrypted).toBe('string');

    const decrypted = decryptMessage(encrypted, key);
    expect(decrypted).toBe(msg);
  });
});
