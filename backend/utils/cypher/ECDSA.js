const crypto = require('crypto');
const { promisify } = require('util');

function generateECDSAKeys() {
    return crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256k1',
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
    generateECDSAKeys
}