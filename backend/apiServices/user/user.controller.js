import sha256 from 'js-sha256';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { createUser, getUserByEmail, getUserById, saveMFASecret } from './user.model.js';
import { generateRSAKeys } from '../../utils/cypher/RSA.js';

const JWT_SECRET = process.env.JWT_SECRET;

const registerUser = async (req, res) => {
    const { email, password } = req.body;

    // Verificar que la solicitud contenga usuario y contraseña
    if (!email || !password ) {
        res.statusMessage = "Email y contraseña son requeridos";
        return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    const passwordHash = sha256(password);

    // Verificar si el usuario ya existe
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        res.statusMessage = "El usuario ya existe. Intenta con otro correo.";
        return res.status(400).json({ message: "El usuario ya existe. Intenta con otro correo." });
    }

    try {

        // Generar llaves RSA
        const { publicKey: publicKeyRSA, privateKey: privateKeyRSA } = generateRSAKeys();

        
        const userId = await createUser({ email, passwordHash, publicKeyRSA });

        // Generar token JWT, con una expiración de 1 hora
        const token = jwt.sign(
            { id: userId, email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ message: 'Usario registrado exitosamente.', userId, token, publicKeyRSA, privateKeyRSA });
    } catch (error) {
        console.log("Error al crear el usuario:", error);
        res.status(500).json({ message: 'Ocurrió un error al crear el usuario:', error });
    }
}

const loginUser = async (req, res) => {
    console.log("Login user")
}

const setupMFA = async (req, res) => {
    const { userId } = req.params;

    // Generar secreto
    const secret = speakeasy.generateSecret({ 
        length: 20,
        name: 'Cifrados Proyecto 2'
    });

    // Guardar secret.base32 en BD
    await saveMFASecret(userId, secret.base32);

    const qr = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
        qrCode: qr,
        manualEntry: secret.base32,
    });
}

const verifyMFA = async (req, res) => {
    const { userId } = req.params;
    const { token } = req.body;

    // Obtener el secreto del usuario de la base de datos
    const user = await getUserById(userId);
    if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar el token
    const verified = speakeasy.totp.verify({
        secret: user.totp_secret,
        encoding: 'base32',
        token,
    });

    if (verified) {
        return res.status(200).json({ message: 'Token verificado exitosamente' });
    } else {
        return res.status(401).json({ message: 'Token inválido' });
    }
}

export {
    registerUser,
    loginUser,
    setupMFA,
    verifyMFA,
}