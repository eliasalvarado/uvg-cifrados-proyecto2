export function generateBitsBases(length = 50) {
  const bits = Array.from({ length }, () => Math.round(Math.random()));
  const bases = Array.from({ length }, () => (Math.random() < 0.5 ? '↕' : '↗'));
  return { bits, bases };
}

export function encodePhotons(bits, bases) {
  return bits.map((bit, i) => {
    if (bases[i] === '↕') {
      return bit === 0 ? '|' : '-';
    } else {
      return bit === 0 ? '/' : '\\';
    }
  });
}

export function measurePhotons(photons, bases) {
  return photons.map((photon, i) => {
    if (bases[i] === '↕') {
      return photon === '|' ? 0 : 1;
    } else {
      return photon === '/' ? 0 : 1;
    }
  });
}

export function compareBasesAndGenerateKey(aliceBits, aliceBases, bobBases) {
  const key = [];
  for (let i = 0; i < aliceBases.length; i++) {
    if (aliceBases[i] === bobBases[i]) {
      key.push(aliceBits[i]);
    }
  }
  return key;
}