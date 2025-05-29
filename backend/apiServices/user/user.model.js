import { executeQuery } from '../../db/connection.js';

const createUser = async ({ email, passwordHash, publicKeyRSA, publicKeyECDSA, privateKeyECDSA }) => {
    const query = 'INSERT INTO users (email, password_hash, rsa_public_key, ecdsa_public_key, ecdsa_private_key, username) VALUES (?, ?, ?, ?, ?)';
    const [result] = await executeQuery(query, [email, passwordHash, publicKeyRSA, publicKeyECDSA, privateKeyECDSA, email]);
    return result.insertId;
};

const getUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await executeQuery(query, [email]);
    return rows[0];
};

const getUserById = async (userId) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await executeQuery(query, [userId]);
    return rows[0];
}

const saveMFASecret = async (userId, secret) => {
    const query = 'UPDATE users SET totp_secret = ?, mfa_enabled = true WHERE id = ?';
    const [result] = await executeQuery(query, [secret, userId]);
    return result.affectedRows > 0;
}

export {
    createUser,
    getUserByEmail,
    getUserById,
    saveMFASecret,
}