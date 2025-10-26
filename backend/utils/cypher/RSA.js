import { publicEncrypt, privateDecrypt, generateKeyPairSync } from 'node:crypto';

/**
 * 
 * @param {String} text - Texto plano a cifrar
 * @param {String|Buffer} publicKey - Clave pública en formato PEM
 * @returns {String} - Texto cifrado en base64
 */
export const encryptRSA = (text, publicKey) => {
  const buffer = Buffer.from(text, 'utf-8');
  const encrypted = publicEncrypt(publicKey, buffer);
  return encrypted.toString('base64');
};

/**
 * 
 * @param {String} encryptedText - Texto cifrado en base64
 * @param {String|Buffer} privateKey - Clave privada en formato PEM
 * @returns {String} - Texto descifrado en utf-8
 */
export const decryptRSA = (encryptedText, privateKey) => {
  const buffer = Buffer.from(encryptedText, 'base64');
  const decrypted = privateDecrypt(privateKey, buffer);
  return decrypted.toString('utf-8');
};


/**
 * 
 * @returns {{ publicKey: string, privateKey: string }} - Retorna un par de claves en formato PEM
 */
export const generateRSAKeys = () => {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });
  
    return { publicKey, privateKey };
  };