import { generateBitsBases, encodePhotons, measurePhotons, compareBasesAndGenerateKey } from '../QKD/keyGenerator.js';

describe('QKD keyGenerator', () => {
  it('generateBitsBases returns arrays of requested length', () => {
    const { bits, bases } = generateBitsBases(10);
    expect(bits).toHaveLength(10);
    expect(bases).toHaveLength(10);
  });

  it('generateBitsBases default length is 50 and values valid', () => {
    const { bits, bases } = generateBitsBases();
    expect(bits).toHaveLength(50);
    expect(bases).toHaveLength(50);
    expect(bits.every(b => b === 0 || b === 1)).toBe(true);
    expect(bases.every(b => b === '↕' || b === '↗')).toBe(true);
  });

  it('encode and measure photons roundtrip', () => {
    const bits = [0,1,1,0];
    const bases = ['↕','↗','↕','↗'];
    const photons = encodePhotons(bits, bases);
    const measured = measurePhotons(photons, bases);
    expect(measured).toEqual(bits);
  });

  it('compareBasesAndGenerateKey picks bits where bases match', () => {
    const aliceBits = [0,1,0,1];
    const aliceBases = ['↕','↗','↕','↕'];
    const bobBases =   ['↕','↗','↗','↕'];
    const key = compareBasesAndGenerateKey(aliceBits, aliceBases, bobBases);
    // matches at positions 0,1,3 -> bits [0,1,1]
    expect(key).toEqual([0,1,1]);
  });
});
