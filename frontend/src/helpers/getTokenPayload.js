/**
 * @function getTokenPayload: Función que devuelve en formato JSON el payload de un token
 *
 * @param {string} token: Token de la sesión
 *
 * @throws {Error} Token inválido si no está en un formato adecuado o no es un string.
 *
 * @returns {Object} Payload del token en formato JSON {id, email}
 */
export default function getTokenPayload(token) {
  if (typeof token !== 'string') throw new Error('Token Invalido.');

  const encodedPayload = token.split('.')[1];
  if (!encodedPayload) throw new Error('Token Invalido.');

  // Reemplazar caracteres Base64URL por Base64 estándar
  const base64 = encodedPayload.replaceAll('-', '+').replaceAll('_', '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');

  const json = atob(padded); // Decodificar Base64
  const payload = JSON.parse(json); // Convertir a objeto

  return payload;
};
