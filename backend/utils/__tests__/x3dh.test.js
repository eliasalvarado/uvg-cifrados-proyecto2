// Mocks for @stablelib modules used by X3DH (virtual so Jest won't try to resolve real packages)
jest.mock('@stablelib/x25519', () => ({
  generateKeyPair: () => ({ publicKey: 'pk', secretKey: 'sk' }),
  sharedKey: (a, b) => new Uint8Array([1,2,3,4])
}), { virtual: true });
jest.mock('@stablelib/hkdf', () => ({
  // return a 32-byte derived key regardless of arguments
  hkdf: (..._args) => new Uint8Array(32)
}), { virtual: true });
jest.mock('@stablelib/sha256', () => ({ SHA256: 'sha256' }), { virtual: true });
jest.mock('@stablelib/chacha20poly1305', () => ({
  ChaCha20Poly1305: function(key) {
    return {
      seal: (nonce, plaintext) => plaintext, // echo plaintext as ciphertext
      open: (nonce, ciphertext) => ciphertext // echo back
    };
  }
}), { virtual: true });
jest.mock('@stablelib/random', () => ({ randomBytes: (n) => new Uint8Array(n) }), { virtual: true });

import { generateKey, deriveSharedSecret, encrypt, decrypt } from '../cypher/X3DH.js';

describe('X3DH mocks', () => {
  it('generateKey returns a pair-like object', () => {
    const k = generateKey();
    expect(k).toHaveProperty('publicKey');
    expect(k).toHaveProperty('secretKey');
  });

  it('deriveSharedSecret returns hkdf-derived key', () => {
    const d = deriveSharedSecret('a','b','c','d','e');
    expect(d).toBeInstanceOf(Uint8Array);
    expect(d.length).toBe(32);
  });

  it('encrypt/decrypt roundtrip with mocked ChaCha returns plaintext', () => {
    const key = new Uint8Array(32);
    const pt = new Uint8Array([1,2,3]);
    const { ciphertext, nonce } = encrypt(key, pt);
    const out = decrypt(key, nonce, ciphertext);
    expect(out).toEqual(pt);
  });

  it('decrypt throws when ChaCha open returns falsy', async () => {
    // Reset module registry and provide a ChaCha mock that returns null from open
    jest.resetModules();
    jest.doMock('@stablelib/x25519', () => ({
      generateKeyPair: () => ({ publicKey: 'pk', secretKey: 'sk' }),
      sharedKey: (a, b) => new Uint8Array([1,2,3,4])
    }), { virtual: true });
    jest.doMock('@stablelib/hkdf', () => ({ hkdf: (..._args) => new Uint8Array(32) }), { virtual: true });
    jest.doMock('@stablelib/sha256', () => ({ SHA256: 'sha256' }), { virtual: true });
    jest.doMock('@stablelib/chacha20poly1305', () => ({
      ChaCha20Poly1305: function(key) {
        return {
          seal: (nonce, plaintext) => plaintext,
          open: (nonce, ciphertext) => null
        };
      }
    }), { virtual: true });
    jest.doMock('@stablelib/random', () => ({ randomBytes: (n) => new Uint8Array(n) }), { virtual: true });

    const mod = await import('../cypher/X3DH.js');
    const { decrypt } = mod;
    const key = new Uint8Array(32);
    const pt = new Uint8Array([9,9]);
    // encrypt will return plaintext as ciphertext given the mock
    const { nonce, ciphertext } = mod.encrypt(key, pt);
    expect(() => decrypt(key, nonce, ciphertext)).toThrow('Fallo al descifrar');
  });
});
