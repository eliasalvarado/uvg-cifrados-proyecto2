import { decryptAES256, encryptAES256, generateAES256Key } from "./AES-256"
import { decryptRSA, encryptRSA } from "./RSA";

const encryptAESRSA = async (text, publicKey) => {

    const key = generateAES256Key();
    const textEncrypted = await encryptAES256(text, key);

    // Encriptar la key AES con la llave pública RSA
    const keyEncrypted = await encryptRSA(key, publicKey);

    return {
        textEncrypted,
        keyEncrypted
    };

}

const decryptAESRSA = async (textEncrypted, keyEncrypted, privateKey) => {
    // Desencriptar la key AES con la llave privada RSA
    const key = await decryptRSA(keyEncrypted, privateKey);
    // Desencriptar el texto con la key AES
    const text = await decryptAES256(textEncrypted, key);

    return text;
};

export {
    encryptAESRSA,
    decryptAESRSA
};