import { encrypt, decrypt } from 'js-crypto-aes';

// Funciones auxiliares para encoding
const stringToUint8Array = (str) => {
  return new TextEncoder().encode(str);
};

const uint8ArrayToString = (bytes) => {
  return new TextDecoder().decode(bytes);
};

const uint8ArrayToBase64 = (bytes) => {
  // Use fromCodePoint to correctly handle Unicode code points
  return btoa(String.fromCodePoint(...bytes));
};

const base64ToUint8Array = (base64) => {
  // Use codePointAt to correctly get Unicode code points
  return new Uint8Array(atob(base64).split('').map(char => char.codePointAt(0)));
};

// Generar key aleatoria AES-256 (32 bytes)
const generateAES256Key = () => {
  return crypto.getRandomValues(new Uint8Array(32));
};

/**
 * Encripta un texto usando AES-256-GCM con key y IV aleatorio.
 * Devuelve base64 con IV + ciphertext.
 * @param {string} plaintext
 * @param {Uint8Array} key 32 bytes
 * @returns {Promise<string>} base64 de IV + ciphertext
 */
const encryptAES256 = async (plaintext, key) => {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // IV 12 bytes para GCM
  const dataBytes = stringToUint8Array(plaintext);
  const ciphertext = await encrypt(dataBytes, key, { iv });
  
  // Concatenar IV + ciphertext para enviarlo junto
  const combined = new Uint8Array(iv.length + ciphertext.length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  
  return uint8ArrayToBase64(combined);
};

/**
 * Desencripta un base64 que contiene IV + ciphertext con la key.
 * @param {string} base64Ciphertext
 * @param {Uint8Array} key 32 bytes
 * @returns {Promise<string>} texto desencriptado
 */
const decryptAES256 = async (base64Ciphertext, key) => {
  try{
  const combined = base64ToUint8Array(base64Ciphertext);
  const iv = combined.slice(0, 12); // IV de 12 bytes para GCM
  const ciphertext = combined.slice(12);
  
  const decryptedBytes = await decrypt(ciphertext, key, { iv });
  return uint8ArrayToString(new Uint8Array(decryptedBytes));
  }catch(error) {
    console.error("Error al desencriptar AES-256:", error);
    return base64Ciphertext;
  }
};

export { generateAES256Key, encryptAES256, decryptAES256 };