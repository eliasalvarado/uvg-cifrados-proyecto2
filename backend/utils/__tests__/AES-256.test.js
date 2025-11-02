import { encrypt, decrypt } from '../cypher/AES-256.js';
import { randomBytes } from 'node:crypto';

describe('AES-256 helper', () => {
  test('encrypt/decrypt roundtrip', () => {
    const key = randomBytes(32); // 32 bytes for AES-256
    const plaintext = 'Mensaje secreto de prueba';

    const encrypted = encrypt(plaintext, key);
    expect(typeof encrypted).toBe('string');
    expect(encrypted.length).toBeGreaterThan(0);

    const decrypted = decrypt(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });
});
