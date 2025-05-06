import jwt from 'jsonwebtoken';

const secret = 'clave_secreta_super_segura';

export function verifyToken(token) {
  return jwt.verify(token, secret);
}
