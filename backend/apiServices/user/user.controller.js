import sha256 from 'js-sha256';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { createUser, getUserByEmail, getUserById, saveMFASecret } from './user.model.js';
import { generateRSAKeys } from '../../utils/cypher/RSA.js';
import { generateECDSAKeys } from '../../utils/cypher/ECDSA.js'

const JWT_SECRET = process.env.JWT_SECRET;

const registerUser = async (req, res) => {
    const { email, password } = req.body;

    // Verificar que la solicitud contenga usuario y contraseña
    if (!email || !password) {
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

        // Generar llaves ECDSA
        const { publicKey: publicKeyECDSA, privateKey: privateKeyECDSA } = generateECDSAKeys();


        const userId = await createUser({
            email,
            passwordHash,
            publicKeyRSA,
            publicKeyECDSA,
            privateKeyECDSA
        });

        // Generar token JWT, con una expiración de 1 hora
        const token = jwt.sign(
            { id: userId, email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ message: 'Usario registrado exitosamente.', userId, token, publicKeyRSA, privateKeyRSA, publicKeyECDSA, privateKeyECDSA });
    } catch (error) {
        console.log("Error al crear el usuario:", error);
        res.status(500).json({ message: 'Ocurrió un error al crear el usuario:', error });
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Verificar que la solicitud contenga usuario y contraseña
    if (!email || !password) {
        res.statusMessage = "Email y contraseña son requeridos";
        return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    try {
        // Buscar el usuario por email
        const user = await getUserByEmail(email);
        if (!user) {
            res.statusMessage = "No se encontró un usuario con el correo indicado";
            return res.status(401).json({ message: "No se encontró un usuario con el correo indicado" });
        }

        // Comparar la contraseña hasheada
        const passwordHash = sha256(password);
        if (user.password_hash !== passwordHash) {
            res.statusMessage = "Credenciales inválidas";
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        // Verificar si el usuario tiene habilitada la autenticación de dos factores (MFA)
        if (user.mfa_enabled) {
            return res.status(200).json({ message: "MFA habilitada. Ingresa el código de tu autenticador.", user_id: user.id, mfa_enabled: true });
        }

        // Generar el token JWT, con una expiración de 1 hora
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: "Login exitoso", token });
    } catch (error) {
        res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
    }
}

const getUserInfo = async (req, res) => {
    const userId = req.user && req.user.id; // Obtener el ID del usuario desde el token JWT

    // Obtener el usuario de la base de datos
    const user = await getUserById(userId);
    if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const response = {
        id: user.id,
        email: user.email,
        rsa_public_key: user.rsa_public_key,
        mfa_enabled: user.mfa_enabled,
    }

    res.status(200).json(response);
}

const setupMFA = async (req, res) => {
    const userId = req.user && req.user.id; // Obtener el ID del usuario desde el token JWT

    // Generar secreto
    const secret = speakeasy.generateSecret({
        length: 20,
        name: 'Cifrados Proyecto 2'
    });

    // Guardar secret.base32 en BD
    await saveMFASecret(userId, secret.base32);

    const qr = await qrcode.toDataURL(secret.otpauth_url);

    res.status(200).json({
        qrCode: qr,
        manualEntry: secret.base32,
    });
}

const verifyMFA = async (req, res) => {
    const { userId } = req.params;
    const { token } = req.body;

    console.log('Token received:', token);
    console.log('User ID received:', userId);

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

        // Generar el token JWT, con una expiración de 1 hora
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({ message: 'Token verificado exitosamente', token });
    } else {
        return res.status(401).json({ message: 'Token inválido' });
    }
}

export {
    registerUser,
    loginUser,
    getUserInfo,
    setupMFA,
    verifyMFA,
}