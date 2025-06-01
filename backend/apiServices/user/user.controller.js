import sha256 from 'js-sha256';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { createUser, getUserByEmail, getUserById, saveMFASecret, deleteMFASecret, searchUserByEmailOrUsername } from './user.model.js';
import { generateRSAKeys } from '../../utils/cypher/RSA.js';
import { generateECDSAKeys } from '../../utils/cypher/ECDSA.js'
import CustomError from '../../utils/customError.js';

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
            privateKeyRSA,
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

        res.status(200).json({ message: "Login exitoso", token, privateKeyRSA: user.privateKeyRSA });
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
        username: user.username,
        email: user.email,
        rsa_public_key: user.rsa_public_key,
        mfa_enabled: user.mfa_enabled,
    }

    res.status(200).json(response);
}

const getUserByIdController = async (req, res) => {

    try{
        const { userId } = req.params;

        // Obtener el usuario de la base de datos
        const user = await getUserById(userId);
        if (!user) {
            throw new CustomError('Usuario no encontrado', 404);
        }

        res.status(200).json({
            id: user.id,
            email: user.email,
            username: user.username,
            rsaPublicKey: user.rsa_public_key,
        });

    }catch(ex){
        console.log(ex);
        errorSender({res, ex });
    }
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

const deleteMFA = async (req, res) => {
    const userId = req.user && req.user.id; // Obtener el ID del usuario desde el token JWT
    console.log('User ID for MFA deletion:', userId);

    // Eliminar el secreto de la base de datos
    const deleted = await deleteMFASecret(userId);
    if (!deleted) {
        return res.status(500).json({ message: 'Error al eliminar la autenticación de dos factores' });
    }

    res.status(200).json({ message: 'Autenticación de dos factores eliminada exitosamente' });
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

        return res.status(200).json({ message: 'Token verificado exitosamente', token, privateKeyRSA: user.rsa_private_key });
    } else {
        return res.status(401).json({ message: 'Token inválido' });
    }
}

const searchUserController = async (req, res) => {

    try{

        const { search } = req.params;
        if (!search) {
            throw new CustomError('El término de búsqueda es requerido', 400);
        }

        // Buscar usuario por email o username
        const user = await searchUserByEmailOrUsername(search);
        if (!user) {
            throw new CustomError('Usuario no encontrado', 404);
        }

        res.status(200).json({
            ok: true,
            result: {
                id: user.id,
                email: user.email,
                username: user.username,
                rsaPublicKey: user.rsa_public_key
            }
        });
        
    }catch(ex){
    console.log(ex)
        errorSender({res, ex })
   }


}


export {
    registerUser,
    loginUser,
    getUserInfo,
    setupMFA,
    verifyMFA,
    deleteMFA,
    searchUserController,
    getUserByIdController
}