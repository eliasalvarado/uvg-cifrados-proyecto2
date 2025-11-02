import { encryptGCM, decryptGCM } from '../cypher/AES-256-GCM.js';
import { randomBytes } from 'node:crypto';

describe('AES-256-GCM', () => {
  it('encrypts and decrypts a message', () => {
    const key = randomBytes(32);
    const txt = 'plaintext test 2025';
    const cipher = encryptGCM(txt, key);
    const out = decryptGCM(cipher, key);
    expect(out).toBe(txt);
  });
});
