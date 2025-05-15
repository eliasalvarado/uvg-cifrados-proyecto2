import { Router } from 'express';
const router = Router();
import { generateKeys, signMessage, verifyMessage } from './signature.controller.js';

router.post('/generate-keys', generateKeys);
router.post('/sign', signMessage);
router.post('/verify', verifyMessage);

export default router;
