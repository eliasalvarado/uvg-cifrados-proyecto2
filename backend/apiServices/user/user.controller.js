import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { OAuth2Client } from 'google-auth-library';
import { createUser, createGoogleUser, getUserByEmail, getUserById, saveMFASecret, deleteMFASecret, searchUserByEmailOrUsername } from './user.model.js';
import { generateRSAKeys } from '../../utils/cypher/RSA.js';
import { generateECDSAKeys } from '../../utils/cypher/ECDSA.js'
import CustomError from '../../utils/customError.js';
import errorSender from '../../utils/errorSender.js';

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;  
const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const registerUser = async (req, res) => {
    const { email, username, password } = req.body;

    // Verificar que la solicitud contenga usuario y contraseña
    if (!email || !username || !password) {
        res.statusMessage = "Email y contraseña son requeridos";
        return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    // Verificar si el usuario ya existe
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        res.statusMessage = "El usuario ya existe. Intenta con otro correo.";
        return res.status(400).json({ message: "El usuario ya existe. Intenta con otro correo." });
    }

    try {

        // Hashear la contraseña con Argon2
        const passwordHash = await argon2.hash(password);

        // Generar llaves RSA
        const { publicKey: publicKeyRSA, privateKey: privateKeyRSA } = generateRSAKeys();

        // Generar llaves ECDSA
        const { publicKey: publicKeyECDSA, privateKey: privateKeyECDSA } = generateECDSAKeys();


        const userId = await createUser({
            email,
            passwordHash,
            publicKeyRSA,
            publicKeyECDSA,
            username,
            privateKeyRSA,
            privateKeyECDSA
        });

        // Generar token JWT, con una expiración de 1 hora
        const token = jwt.sign(
            { id: userId, email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ message: 'Usario registrado exitosamente.',
            userId,
            token,
            publicKeyRSA,
            privateKeyRSA,
            publicKeyECDSA,
            privateKeyECDSA
        });
    } catch (error) {
        errorSender({ res, ex: error, defaultError: 'Ocurrió un error al crear el usuario.' });
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

        // Comparar la contraseña hasheada con Argon2
        const validPassword = await argon2.verify(user.password_hash, password);
        if (!validPassword) {
            res.statusMessage = "Credenciales incorrectas";
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        // Verificar si el usuario tiene habilitada la autenticación de dos factores (MFA)
        if (user.mfa_enabled) {
            return res.status(200).json({ message: "MFA habilitada. Ingresa el código de tu autenticador.", userId: user.id, mfa_enabled: true });
        }

        // Generar el token JWT, con una expiración de 1 hora
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.status(200).json({
            message: "Login exitoso",
            token,
            privateKeyRSA: user.rsa_private_key,
            publicKeyRSA: user.rsa_public_key,
            privateKeyECDSA: user.ecdsa_private_key,
            publicKeyECDSA: user.ecdsa_public_key
        });
    } catch (error) {
        errorSender({ res, ex: error, defaultError: 'Error al iniciar sesión.' });
    }
}

const loginGoogleUser = async (req, res) => {
    const { token } = req.body;

    // Verificar que el token de Google esté presente
    if (!token) {
        res.statusMessage = "Token de Google es requerido";
        return res.status(400).json({ message: "Token de Google es requerido" });
    }

    // Verificar el token de Google
    const ticket = await oauthClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const googleId = payload.sub;
    const username = payload.name || email; // Usar el nombre del usuario o el email como nombre de usuario

    // Verificar si el usuario ya existe en la base de datos
    let user = await getUserByEmail(email);

    if (user) {
        // Si el usuario ya existe, verificar si tiene autenticación de dos factores habilitada
        if (user.mfa_enabled) {
            return res.status(200).json({ message: "MFA habilitada. Ingresa el código de tu autenticador.", userId: user.id, mfa_enabled: true });
        }
        // Si el usuario ya existe y no tiene MFA habilitada, generar un nuevo token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.status(200).json({
            message: "Login exitoso",
            token,
            privateKeyRSA: user.rsa_private_key,
            publicKeyRSA: user.rsa_public_key,
            publicKeyECDSA: user.ecdsa_public_key,
            privateKeyECDSA: user.ecdsa_private_key,
        });
    } else {
        // Si el usuario no existe, crear uno nuevo
        const { publicKey: publicKeyRSA, privateKey: privateKeyRSA } = generateRSAKeys();
        const { publicKey: publicKeyECDSA, privateKey: privateKeyECDSA } = generateECDSAKeys();
        
        const userId = await createGoogleUser({
            email,
            googleId,
            publicKeyRSA,
            publicKeyECDSA,
            username,
            privateKeyRSA,
            privateKeyECDSA
        });

        user = {
            id: userId,
            email,
            username,
            provider: 'google',
            rsa_public_key: publicKeyRSA,
            rsa_private_key: privateKeyRSA,
            ecdsa_public_key: publicKeyECDSA,
            ecdsa_private_key: privateKeyECDSA,
            mfa_enabled: false, // Por defecto, MFA no está habilitado
            google_id: googleId,
        };

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ message: 'Usuario creado exitosamente.',
            userId: userId,
            token,
            publicKeyRSA: user.rsa_public_key,
            privateKeyRSA: user.rsa_private_key,
            publicKeyECDSA: user.ecdsa_public_key,
            privateKeyECDSA: user.ecdsa_private_key,
            newUser: true
        });
    }
}

const getUserInfo = async (req, res) => {
    const userId = req?.user?.id; // Obtener el ID del usuario desde el token JWT

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
        ecdsa_public_key: user.ecdsa_public_key,
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
            ecdsaPublicKey: user.ecdsa_public_key
        });

    }catch(ex){
        errorSender({res, ex });
    }
}
    

const setupMFA = async (req, res) => {
    const userId = req?.user?.id; // Obtener el ID del usuario desde el token JWT

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
    const userId = req?.user?.id; // Obtener el ID del usuario desde el token JWT

    try {
        // Eliminar el secreto de la base de datos
        const deleted = await deleteMFASecret(userId);
        if (!deleted) {
            throw new CustomError('Error al eliminar la autenticación de dos factores', 500);
        }

        res.status(200).json({ message: 'Autenticación de dos factores eliminada exitosamente' });
    } catch (error) {
        errorSender({ res, ex: error, defaultError: 'Error al eliminar la autenticación de dos factores.' });
    }
}

const verifyMFA = async (req, res) => {
    const { userId } = req.params;
    const { token } = req.body;

    try {
        // Obtener el secreto del usuario de la base de datos
        const user = await getUserById(userId);
        if (!user) {
            throw new CustomError('Usuario no encontrado', 404);
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

            return res.status(200).json({ 
                message: 'Token verificado exitosamente',
                token,
                privateKeyRSA: user.rsa_private_key,
                publicKeyRSA: user.rsa_public_key,
                privateKeyECDSA: user.ecdsa_private_key,
                publicKeyECDSA: user.ecdsa_public_key
            });
        } else {
            throw new CustomError('Código de autenticación inválido', 401);
        }
    } catch (error) {
        errorSender({ res, ex: error, defaultError: 'Error al verificar el código de autenticación.' });
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
                rsaPublicKey: user.rsa_public_key,
                ecdsaPublicKey: user.ecdsa_public_key
            }
        });
        
    }catch(ex){
        errorSender({res, ex })
   }


}


export {
    registerUser,
    loginUser,
    loginGoogleUser,
    getUserInfo,
    setupMFA,
    verifyMFA,
    deleteMFA,
    searchUserController,
    getUserByIdController
}