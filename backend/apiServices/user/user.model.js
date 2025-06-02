import { executeQuery } from '../../db/connection.js';

const createUser = async ({ email, passwordHash, publicKeyRSA, publicKeyECDSA, privateKeyRSA }) => {
    const query = 'INSERT INTO users (email, password_hash, rsa_public_key, ecdsa_public_key, username, rsa_private_key) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await executeQuery(query, [email, passwordHash, publicKeyRSA, publicKeyECDSA, email, privateKeyRSA]);
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

const deleteMFASecret = async (userId) => {
    const query = 'UPDATE users SET totp_secret = NULL, mfa_enabled = false WHERE id = ?';
    const [result] = await executeQuery(query, [userId]);
    return result.affectedRows > 0;
}

const searchUserByEmailOrUsername = async (searchTerm) => {
    const query = `
        SELECT id, email, username, rsa_public_key
        FROM users
        WHERE email = ? OR username = ?
        LIMIT 1
    `;
    const [rows] = await executeQuery(query, [`${searchTerm}`, `${searchTerm}`]);
    return rows?.[0] || null;
}

export {
    createUser,
    getUserByEmail,
    getUserById,
    saveMFASecret,
    deleteMFASecret,
    searchUserByEmailOrUsername
}