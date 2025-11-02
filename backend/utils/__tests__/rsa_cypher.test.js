import { generateRSAKeys, encryptRSA, decryptRSA } from '../cypher/RSA_cypher.js';

describe('RSA_cypher', () => {
  it('generates keys and roundtrips encryption', () => {
    const { publicKey, privateKey } = generateRSAKeys();
    const text = 'another secret';
    const encrypted = encryptRSA(text, publicKey);
    const decrypted = decryptRSA(encrypted, privateKey);
    expect(decrypted).toBe(text);
  });
});
