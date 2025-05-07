import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * 
 * @param {String} text - Texto a cifrar
 * @param {Buffer} key - Llave de 32 bytes
 * @returns {String} - Mensaje cifrado en hex (IV + ciphertext + authTag)
 */
export const encryptGCM = (text, key) => {
  const iv = randomBytes(12); // 12 bytes recomendado para GCM
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  // Retorna IV + encrypted + authTag
  return iv.toString('hex') + encrypted + authTag.toString('hex');
};

/**
 * 
 * @param {String} encryptedHex - Mensaje cifrado (IV + ciphertext + authTag)
 * @param {Buffer} key - Llave de 32 bytes
 * @returns {String} - Texto descifrado
 */
export const decryptGCM = (encryptedHex, key) => {
  const iv = Buffer.from(encryptedHex.slice(0, 24), 'hex'); // 12 bytes IV
  const authTag = Buffer.from(encryptedHex.slice(-32), 'hex'); // 16 bytes tag
  const encrypted = encryptedHex.slice(24, -32); // el resto es texto cifrado

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
};
