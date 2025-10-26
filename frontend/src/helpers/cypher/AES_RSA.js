import { decryptAES256, encryptAES256, generateAES256Key } from "./AES-256"
import { decryptRSA, encryptRSA } from "./RSA";

const encryptAESRSA = async (text, targetPublicKey, originPublicKey) => {

    const key = generateAES256Key();
    const textEncrypted = await encryptAES256(text, key);

    // Encriptar la key AES con la llave pública RSA del destinatario
    const targetKeyEncrypted = await encryptRSA(key, targetPublicKey);

    // Encriptar la key AES con la llave pública RSA del remitente 
    const originKeyEncrypted = await encryptRSA(key, originPublicKey);

    return {
        textEncrypted,
        targetKeyEncrypted,
        originKeyEncrypted
    };

}

const decryptAESRSA = async (textEncrypted, keyEncrypted, privateKey) => {
    try{
    // Desencriptar la key AES con la llave privada RSA
    const key = decryptRSA(keyEncrypted, privateKey);
    // Desencriptar el texto con la key AES
    const text = await decryptAES256(textEncrypted, key);

    return text;
    }catch (error) {
        console.error("Error al desencriptar AES-RSA:", error);
        return textEncrypted
    }
};

export {
    encryptAESRSA,
    decryptAESRSA
};