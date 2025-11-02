import { generateRSAKeys, encryptRSA, decryptRSA } from '../cypher/RSA.js';

describe('RSA cypher', () => {
  it('generates keys and roundtrips encryption', () => {
    const { publicKey, privateKey } = generateRSAKeys();
    const text = 'secret message';
    const encrypted = encryptRSA(text, publicKey);
    const decrypted = decryptRSA(encrypted, privateKey);
    expect(decrypted).toBe(text);
  });
});
