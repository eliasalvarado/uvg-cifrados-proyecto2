import { generateECDSAKeys, verifySignature } from '../cypher/ECDSA.js';
import crypto from 'node:crypto';

describe('ECDSA', () => {
  it('generates keys and verifies signature', () => {
    const { publicKey, privateKey } = generateECDSAKeys();
    const message = 'hello ecdsa';
    const signature = crypto.sign('sha256', Buffer.from(message, 'utf8'), { key: privateKey, dsaEncoding: 'der' });
    const signatureBase64 = signature.toString('base64');

    const ok = verifySignature(message, signatureBase64, publicKey);
    expect(ok).toBe(true);
  });

  it('returns false for invalid inputs', () => {
    expect(verifySignature('', '', '')).toBe(false);
  });

  it('returns false when crypto.verify throws', () => {
    const spy = jest.spyOn(crypto, 'verify').mockImplementation(() => { throw new Error('boom'); });
    const ok = verifySignature('m', 's', 'pk');
    expect(ok).toBe(false);
    spy.mockRestore();
  });
});
