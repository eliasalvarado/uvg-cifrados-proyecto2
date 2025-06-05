import CryptoJS from 'crypto-js';

/**
 * Cifra un mensaje utilizando la clave proporcionada.
 * @param {string} message - Mensaje a cifrar.
 * @param {string} key - Clave para el cifrado.
 * @returns {string} - Mensaje cifrado.
 */
export const encryptMessage = (message, key) => {
  return CryptoJS.AES.encrypt(message, key).toString();
};

/**
 * Descifra un mensaje utilizando la clave proporcionada.
 * @param {string} encryptedMessage - Mensaje cifrado.
 * @param {string} key - Clave para el descifrado.
 * @returns {string} - Mensaje descifrado.
 */
export const decryptMessage = (encryptedMessage, key) => {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};