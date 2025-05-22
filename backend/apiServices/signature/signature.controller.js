import { hashData, signData, verifySignature, generateKeyPair } from '../../utils/signature.js';

let keyPairCache = null;

async function generateKeys(req, res) {
    try {
        keyPairCache = await generateKeyPair();
        res.json({ message: "Key pair generated and cached in memory." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function signMessage(req, res) {
    try {
        if (!keyPairCache || !keyPairCache.privateKey) {
            return res.status(400).json({ error: "Key pair not generated yet." });
        }

        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required." });
        }

        const hashed = await hashData(message);
        const signature = await signData(keyPairCache.privateKey, hashed);
        res.json({ signature: Buffer.from(signature).toString('base64') });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function verifyMessage(req, res) {
    try {
        if (!keyPairCache || !keyPairCache.publicKey) {
            return res.status(400).json({ error: "Key pair not generated yet." });
        }

        const { message, signature } = req.body;
        if (!message || !signature) {
            return res.status(400).json({ error: "Message and signature are required." });
        }

        const hashed = await hashData(message);
        const signatureBuffer = Uint8Array.from(Buffer.from(signature, 'base64'));

        const isValid = await verifySignature(keyPairCache.publicKey, hashed, signatureBuffer);
        res.json({ valid: isValid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export {
    generateKeys,
    signMessage,
    verifyMessage
};
