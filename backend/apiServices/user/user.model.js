import { executeQuery } from '../../db/connection.js';
import CustomError from '../../utils/customError.js';

/* ──────────────────────────────── Validaciones ──────────────────────────────── */

/**
 * Valida un email
 */
const validateEmail = (email) => {
    if (typeof email !== 'string') {
        throw new CustomError('Email debe ser texto', 400);
    }

    const trimmed = email.trim().toLowerCase();

    if (trimmed.length === 0) {
        throw new CustomError('Email no puede estar vacío', 400);
    }

    if (trimmed.length > 255) {
        throw new CustomError('Email demasiado largo', 400);
    }

    // Validación básica de formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
        throw new CustomError('Formato de email inválido', 400);
    }

    return trimmed;
};

/**
 * Valida un username
 */
const validateUsername = (username) => {
    if (typeof username !== 'string') {
        throw new CustomError('Username debe ser texto', 400);
    }

    const trimmed = username.trim();

    if (trimmed.length < 3) {
        throw new CustomError('Username debe tener al menos 3 caracteres', 400);
    }

    if (trimmed.length > 30) {
        throw new CustomError('Username demasiado largo (máx 30 caracteres)', 400);
    }

    // Solo alfanuméricos, guiones bajos y guiones medios
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
        throw new CustomError('Username solo puede contener letras, números, guiones y guiones bajos', 400);
    }

    return trimmed;
};

/**
 * Valida un ID de usuario
 */
const validateUserId = (userId) => {
    const numId = Number(userId);
    if (!Number.isInteger(numId) || numId <= 0) {
        throw new CustomError('ID de usuario inválido', 400);
    }
    return numId;
};

/**
 * Valida un hash de password (debe venir ya hasheado)
 */
const validatePasswordHash = (hash) => {
    if (typeof hash !== 'string') {
        throw new CustomError('Hash de password inválido', 400);
    }

    const trimmed = hash.trim();

    if (trimmed.length < 20) {
        throw new CustomError('Hash de password inválido', 400);
    }

    if (trimmed.length > 500) {
        throw new CustomError('Hash de password demasiado largo', 400);
    }

    return trimmed;
};

/**
 * Valida una clave pública
 */
const validateKey = (key, keyType = 'Clave pública', isPublic = false,) => {
    if (!key) {
        // Las claves públicas son opcionales en algunos casos
        return isPublic ? null : (() => { throw new CustomError(`${keyType} es obligatoria`, 400); })();
    }

    if (typeof key !== 'string') {
        throw new CustomError(`${keyType} inválida`, 400);
    }
    const trimmed = key.trim();


    if (trimmed.length === 0) {
        return isPublic ? null : (() => { throw new CustomError(`${keyType} es obligatoria`, 400); })();
    }

    if (trimmed.length > 10000) {
        throw new CustomError(`${keyType} demasiado larga`, 400);
    }

    return trimmed;
};

/**
 * Valida un Google ID
 */
const validateGoogleId = (googleId) => {
    if (typeof googleId !== 'string') {
        throw new CustomError('Google ID inválido', 400);
    }

    const trimmed = googleId.trim();

    if (trimmed.length === 0) {
        throw new CustomError('Google ID no puede estar vacío', 400);
    }

    if (trimmed.length > 255) {
        throw new CustomError('Google ID demasiado largo', 400);
    }

    return trimmed;
};

/**
 * Valida un secreto TOTP/MFA
 */
const validateMFASecret = (secret) => {
    if (typeof secret !== 'string') {
        throw new CustomError('Secreto MFA inválido', 400);
    }

    const trimmed = secret.trim();

    if (trimmed.length < 16) {
        throw new CustomError('Secreto MFA demasiado corto', 400);
    }

    if (trimmed.length > 500) {
        throw new CustomError('Secreto MFA demasiado largo', 400);
    }

    return trimmed;
};

/**
 * Valida un término de búsqueda
 */
const validateSearchTerm = (term) => {
    if (typeof term !== 'string') {
        throw new CustomError('Término de búsqueda inválido', 400);
    }

    const trimmed = term.trim();

    if (trimmed.length === 0) {
        throw new CustomError('Término de búsqueda vacío', 400);
    }

    if (trimmed.length > 255) {
        throw new CustomError('Término de búsqueda demasiado largo', 400);
    }

    return trimmed;
};

/* ──────────────────────────────── Funciones ──────────────────────────────── */

const createUser = async ({ email, passwordHash, publicKeyRSA, publicKeyECDSA, username, privateKeyRSA, privateKeyECDSA }) => {
    try {
        const validEmail = validateEmail(email);
        const validPasswordHash = validatePasswordHash(passwordHash);
        const validUsername = validateUsername(username);
        const validPublicKeyRSA = validateKey(publicKeyRSA, 'Clave pública RSA', true);
        const validPublicKeyECDSA = validateKey(publicKeyECDSA, 'Clave pública ECDSA', true);
        const validPrivateKeyRSA = validateKey(privateKeyRSA, 'Clave privada RSA');
        const validPrivateKeyECDSA = validateKey(privateKeyECDSA, 'Clave privada ECDSA');

        const query = 'INSERT INTO users (email, password_hash, rsa_public_key, ecdsa_public_key, username, rsa_private_key, ecdsa_private_key) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [result] = await executeQuery(query, [
            validEmail,
            validPasswordHash,
            validPublicKeyRSA,
            validPublicKeyECDSA,
            validUsername,
            validPrivateKeyRSA,
            validPrivateKeyECDSA
        ]);
        return result.insertId;
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new CustomError('El email o username ya está registrado', 409);
        }
        if (error instanceof CustomError) {
            throw error;
        }
        console.error('Error al crear usuario:', error);
        throw new CustomError('Error al crear usuario', 500);
    }
};

const createGoogleUser = async ({ email, googleId, publicKeyRSA, publicKeyECDSA, username, privateKeyRSA, privateKeyECDSA }) => {
    try {
        const validEmail = validateEmail(email);
        const validGoogleId = validateGoogleId(googleId);
        const validUsername = validateUsername(username);
        const validPublicKeyRSA = validateKey(publicKeyRSA, 'Clave pública RSA', true);
        const validPublicKeyECDSA = validateKey(publicKeyECDSA, 'Clave pública ECDSA', true);
        const validPrivateKeyRSA = validateKey(privateKeyRSA, 'Clave privada RSA');
        const validPrivateKeyECDSA = validateKey(privateKeyECDSA, 'Clave privada ECDSA');

        const query = 'INSERT INTO users (email, provider, google_id, rsa_public_key, ecdsa_public_key, username, rsa_private_key, ecdsa_private_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const [result] = await executeQuery(query, [
            validEmail,
            'google',
            validGoogleId,
            validPublicKeyRSA,
            validPublicKeyECDSA,
            validUsername,
            validPrivateKeyRSA,
            validPrivateKeyECDSA
        ]);

        return result.insertId;
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new CustomError('El email o username ya está registrado', 409);
        }
        if (error instanceof CustomError) {
            throw error;
        }
        console.error('Error al crear usuario de Google:', error);
        throw new CustomError('Error al crear usuario de Google', 500);
    }
};

const getUserByEmail = async (email) => {
    try {
        const validEmail = validateEmail(email);
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await executeQuery(query, [validEmail]);
        return rows[0] || null;
    } catch (error) {
        if (error instanceof CustomError) {
            throw error;
        }
        console.error('Error al obtener usuario por email:', error);
        throw new CustomError('Error al obtener usuario', 500);
    }
};

const getUserById = async (userId) => {
    try {
        const validUserId = validateUserId(userId);
        const query = 'SELECT * FROM users WHERE id = ?';
        const [rows] = await executeQuery(query, [validUserId]);
        return rows[0] || null;
    } catch (error) {
        if (error instanceof CustomError) {
            throw error;
        }
        console.error('Error al obtener usuario por ID:', error);
        throw new CustomError('Error al obtener usuario', 500);
    }
}

const saveMFASecret = async (userId, secret) => {
    try {
        const validUserId = validateUserId(userId);
        const validSecret = validateMFASecret(secret);
        const query = 'UPDATE users SET totp_secret = ?, mfa_enabled = true WHERE id = ?';
        const [result] = await executeQuery(query, [validSecret, validUserId]);

        return result.affectedRows > 0;
    } catch (error) {
        if (error instanceof CustomError) {
            throw error;
        }
        console.error('Error al guardar secreto MFA:', error);
        throw new CustomError('Error al guardar secreto MFA', 500);
    }
}


const deleteMFASecret = async (userId) => {
    try {
        const validUserId = validateUserId(userId);
        const query = 'UPDATE users SET totp_secret = NULL, mfa_enabled = false WHERE id = ?';
        const [result] = await executeQuery(query, [validUserId]);

        return result.affectedRows > 0;
    } catch (error) {
        if (error instanceof CustomError) {
            throw error;
        }
        console.error('Error al eliminar secreto MFA:', error);
        throw new CustomError('Error al eliminar secreto MFA', 500);
    }
}

const searchUserByEmailOrUsername = async (searchTerm) => {
    try {
        const validSearchTerm = validateSearchTerm(searchTerm);

        const query = `
        SELECT id, email, username, rsa_public_key
        FROM users
        WHERE email = ? OR username = ?
        LIMIT 1
    `;
        const [rows] = await executeQuery(query, [validSearchTerm, validSearchTerm]);
        return rows?.[0] || null;
    } catch (error) {
        if (error instanceof CustomError) {
            throw error;
        }
        console.error('Error al buscar usuario:', error);
        throw new CustomError('Error al buscar usuario', 500);
    }
}

export {
    createUser,
    createGoogleUser,
    getUserByEmail,
    getUserById,
    saveMFASecret,
    deleteMFASecret,
    searchUserByEmailOrUsername
}