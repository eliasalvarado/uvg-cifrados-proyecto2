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
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  // Retorna el IV concatenado al inicio
  return iv.toString('hex') + encrypted;
};

/**
 * 
 * @param {String} encryptedHex - Texto cifrado en hexadecimal
 * @param {Buffer} key - Debe ser de 32 bytes para AES-256 
 * @returns 
 */
export const decrypt = (encryptedHex, key) => {
  const iv = Buffer.from(encryptedHex.slice(0, 32), 'hex'); // 16 bytes al inicio es IV
  const encrypted = encryptedHex.slice(32); // resto es el texto cifrado
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
};