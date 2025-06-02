import { executeQuery } from '../../db/connection.js';
import { generateRSAKeys } from '../../utils/cypher/RSA.js';

const createGoogleUser = async ({ email, googleId }) => {
    
    try {
        // Generar llaves RSA
        const { publicKey: publicKeyRSA, privateKey: privateKeyRSA } = generateRSAKeys();


        const query = 'INSERT INTO users (email, provider, google_id, rsa_public_key, username, rsa_private_key) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await executeQuery(query, [email, 'google', googleId, publicKeyRSA, email, privateKeyRSA]);
        const newUser = {
            id: result.insertId,
            email,
            googleId,
            rsaPublicKey: publicKeyRSA,
            rsaPrivateKey: privateKeyRSA
        };
        return newUser;
    }
    catch (error) {
        console.error("Error al crear el usuario de Google:", error);
        throw new Error("Error al crear el usuario de Google");
    }
};

const getUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await executeQuery(query, [email]);
    return rows[0];
};

export {
    createGoogleUser,
    getUserByEmail,
}