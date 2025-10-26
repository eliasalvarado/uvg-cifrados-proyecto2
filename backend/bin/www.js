import server from '../app.js';
const PORT = 3000;

import { validateChain } from '../apiServices/blockchain/blockchain.model.js';
import { setHealthy } from '../utils/blockchainHealth.js';

// Usamos top-level await para simplificar la inicialización y evitar
// envolver la lógica en una función async invocada inmediatamente.
// Requiere que el entorno ejecute módulos ES ("type": "module") y
// una versión de Node que soporte top-level await (Node >= 14.8+, preferible >=16).
try {
  /* ── Puerta de hierro ─────────────────────────── */
  const { ok, firstTamperedIndex } = await validateChain();
  setHealthy(ok);
  if (!ok) {
    console.warn(
      `[BLOCKCHAIN]  Integridad rota. Bloque corrupto desde #${firstTamperedIndex}`
    );
  }
  console.log('[BLOCKCHAIN] Cadena OK ✔️');

  /* ── Arrancar servidor ────────────────────────── */
  server.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });
} catch (err) {
  console.error('Error crítico al arrancar:', err);
  process.exit(1);
}