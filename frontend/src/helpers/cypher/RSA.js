import forge from 'node-forge';

export const encryptRSA = (data, publicKeyPem) => {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

  // Convertir Uint8Array a string binario (no UTF-8)
  const binaryString = forge.util.binary.raw.encode(data);

  const encrypted = publicKey.encrypt(binaryString, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
  });

  return forge.util.encode64(encrypted);
};


export const decryptRSA = (base64Ciphertext, privateKeyPem) => {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const encryptedBytes = forge.util.decode64(base64Ciphertext);

  const decryptedBinary = privateKey.decrypt(encryptedBytes, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
  });

  // Convertir string binario a Uint8Array
  return new Uint8Array(forge.util.binary.raw.decode(decryptedBinary));
};
