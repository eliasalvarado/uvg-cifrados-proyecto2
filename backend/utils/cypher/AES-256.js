import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

/**
 * 
 * @param {String} text 
 * @param {Buffer} key - Debe ser de 32 bytes para AES-256
 * @returns {String} - Texto cifrado en hexadecimal
 */
export const encrypt = (text, key) => {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encryptedHex = cipher.update(text, 'utf-8', 'hex') + cipher.final('hex');
  const authTag = cipher.getAuthTag();
  // Return IV (16 bytes) + authTag (16 bytes) + ciphertext, all hex-encoded
  return iv.toString('hex') + authTag.toString('hex') + encryptedHex;
};

/**
 * 
 * @param {String} encryptedHex - Texto cifrado en hexadecimal
 * @param {Buffer} key - Debe ser de 32 bytes para AES-256 
 * @returns 
 */
export const decrypt = (encryptedHex, key) => {
  // Extract IV (16 bytes -> 32 hex chars), authTag (16 bytes -> 32 hex chars), then ciphertext
  const ivHex = encryptedHex.slice(0, 32);
  const authTagHex = encryptedHex.slice(32, 64);
  const cipherTextHex = encryptedHex.slice(64);

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(cipherTextHex, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
};