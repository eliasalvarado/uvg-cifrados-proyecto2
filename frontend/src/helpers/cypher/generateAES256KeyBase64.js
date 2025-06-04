import { randomBytes } from 'crypto';

/**
 * Genera una clave AES-256 aleatoria y la devuelve en formato Base64.
 * @returns {string} Base64 encoded AES-256 key
 */
const generateAES256KeyBase64 = () => {
  const key = randomBytes(32);
  return key.toString('base64');
};

export default generateAES256KeyBase64;