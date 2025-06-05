import server from '../app.js';
const PORT = 3000;

import { validateChain } from '../apiServices/blockchain/blockchain.model.js';
import { setHealthy } from '../utils/blockchainHealth.js';


async function boot() {
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
}

boot().catch((err) => {
  console.error('Error crítico al arrancar:', err);
  process.exit(1);
});