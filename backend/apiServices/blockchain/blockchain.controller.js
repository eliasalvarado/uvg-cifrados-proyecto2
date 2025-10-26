import { addBlock, getAllBlocks, validateChain } from './blockchain.model.js';
import CustomError from '../../utils/customError.js';
import errorSender from '../../utils/errorSender.js';

/* POST /api/transactions */
export async function createTransaction(req, res) {
  try {
    const { from, to, msgHash, sig } = req.body;
    if (!from || !to || !msgHash || !sig) {
      throw new CustomError('Campos incompletos', 400);
    }

    const { index, hash } = await addBlock({ from, to, msgHash, sig });
    res.status(201).json({ message: 'Bloque añadido', index, hash });
  } catch (err) {
    errorSender({ res, ex: err, defaultError: 'Error al crear bloque.' });
  }
}

/* GET /api/transactions */
export async function listTransactions(req, res) {
  try {
    const chain = await getAllBlocks();
    const validation = await validateChain();
    res.json({ chain, validation });
  } catch (err) {
    errorSender({ res, ex: err, defaultError: 'Error al obtener blockchain.' });
  }
}
