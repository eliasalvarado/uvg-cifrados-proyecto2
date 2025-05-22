// x3dh.js
import { generateKeyPair, sharedKey } from "@stablelib/x25519";
import { hkdf } from "@stablelib/hkdf";
import { SHA256 } from "@stablelib/sha256";
import { ChaCha20Poly1305 } from "@stablelib/chacha20poly1305";
import { randomBytes } from "@stablelib/random";

// Genera una nueva pareja de llaves X25519
export const generateKey = () => generateKeyPair();

// Deriva la clave compartida usando los 4 DH de X3DH
export const deriveSharedSecret = (
  IK_sender_sk,
  EK_sender_sk,
  IK_receiver_pk,
  SPK_receiver_pk,
  OPK_receiver_pk
) => {
  const dh1 = sharedKey(IK_sender_sk, SPK_receiver_pk);
  const dh2 = sharedKey(EK_sender_sk, IK_receiver_pk);
  const dh3 = sharedKey(EK_sender_sk, SPK_receiver_pk);
  const dh4 = sharedKey(EK_sender_sk, OPK_receiver_pk);

  const combined = Buffer.concat([dh1, dh2, dh3, dh4]);
  const derived = hkdf(SHA256, combined, new Uint8Array(0), new Uint8Array(32));
  return derived;
};

// Cifra un mensaje con la clave derivada
export const encrypt = (sharedSecret, plaintext) => {
  const chacha = new ChaCha20Poly1305(sharedSecret);
  const nonce = randomBytes(12);
  const ciphertext = chacha.seal(nonce, plaintext);
  return { ciphertext, nonce };
};

// Descifra un mensaje usando la clave y el nonce
export const decrypt = (sharedSecret, nonce, ciphertext) => {
  const chacha = new ChaCha20Poly1305(sharedSecret);
  const plaintext = chacha.open(nonce, ciphertext);
  if (!plaintext) throw new Error("Fallo al descifrar");
  return plaintext;
};