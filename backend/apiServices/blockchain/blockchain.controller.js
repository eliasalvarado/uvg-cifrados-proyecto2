import { addBlock, getAllBlocks, validateChain } from './blockchain.model.js';

/* POST /api/transactions */
export async function createTransaction(req, res) {
  try {
    const { from, to, msgHash, sig } = req.body;
    if (!from || !to || !msgHash || !sig)
      return res.status(400).json({ error: 'Campos incompletos' });

    const { index, hash } = await addBlock({ from, to, msgHash, sig });
    res.status(201).json({ message: 'Bloque añadido', index, hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear bloque' });
  }
}

/* GET /api/transactions */
export async function listTransactions(req, res) {
  try {
    const chain = await getAllBlocks();
    const validation = await validateChain();
    res.json({ chain, validation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener blockchain' });
  }
}
