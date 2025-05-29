import server from '../app.js';

import { validateChain } from '../apiServices/blockchain/blockchain.model.js';

async function boot() {
  /* ── Puerta de hierro ─────────────────────────── */
  const { ok, firstTamperedIndex } = await validateChain();
  if (!ok) {
    console.error(
      `[BLOCKCHAIN]  Integridad rota. Bloque corrupto desde #${firstTamperedIndex}`
    );
    process.exit(1);              // aborta arranque
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