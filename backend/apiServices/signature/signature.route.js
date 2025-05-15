const express = require('express');
const router = express.Router();
const signatureController = require('./signature.controller');

router.post('/generate-keys', signatureController.generateKeys);
router.post('/sign', signatureController.signMessage);
router.post('/verify', signatureController.verifyMessage);

module.exports = router;
