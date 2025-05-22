// auth.middleware.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

const authenticateToken = (req, res, next) => {
  // El token se espera en el header Authorization
  const token = req.headers['authorization'];

  if (!token) {
    res.statusMessage = 'Acceso denegado: token no proporcionado';
    return res.status(401).json({ message: 'Acceso denegado: token no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.statusMessage = 'Token inválido';
      return res.status(403).json({ message: 'Token inválido' });
    }
    // Decoded contiene la carga útil que se firmó en el token, { id, email, password hasheada }
    req.user = decoded;
    next();
  });
};

export default authenticateToken;
