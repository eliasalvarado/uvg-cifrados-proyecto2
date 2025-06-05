import crypto from 'crypto';

function verifySignature(message, signature, publicKeyPem) {
  return crypto.verify(
    'sha256',
    Buffer.from(message, 'utf8'),
    {
        key: publicKeyPem,
        dsaEncoding: 'der'
    },
    Buffer.from(signature, 'base64')
    );
}

function generateECDSAKeys() {
  return crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
}


export {
    generateECDSAKeys, verifySignature
}