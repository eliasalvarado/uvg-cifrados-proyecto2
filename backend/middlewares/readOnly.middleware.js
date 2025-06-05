import { isHealthy } from '../utils/blockchainHealth.js';

export default function readOnlyGuard(req, res, next) {
  if (!isHealthy()) {
    return res
      .status(503)
      .json({ error: 'Servicio en modo solo lectura: blockchain corrupta' });
  }
  next();
}
