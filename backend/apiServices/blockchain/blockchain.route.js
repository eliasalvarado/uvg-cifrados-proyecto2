import express from 'express';
import { createTransaction, listTransactions } from './blockchain.controller.js';

const router = express.Router();

router.post('/', createTransaction);  // POST /api/transactions
router.get('/',  listTransactions);   // GET  /api/transactions

export default router;
