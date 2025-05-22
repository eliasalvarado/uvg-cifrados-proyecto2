import pkg from 'elliptic';
const EC = pkg.ec;

const ec = new EC('secp256k1');

function generateECDSAKeys() {
    const keyPair = ec.genKeyPair();
    const publicKey = keyPair.getPublic('hex');
    const privateKey = keyPair.getPrivate('hex');
    return { publicKey, privateKey };
}

export {
    generateECDSAKeys
}