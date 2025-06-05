import crypto from 'crypto';

function verifySignature(message, signature, publicKeyPem) {
  if (!message || !signature || !publicKeyPem) {
    return false;
  }
  try {
    return crypto.verify(
      'sha256',
      Buffer.from(message, 'utf8'),
      {
        key: publicKeyPem,
        dsaEncoding: 'der'
      },
      Buffer.from(signature, 'base64')
    );
  } catch (Exception) {
    return false
  }
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