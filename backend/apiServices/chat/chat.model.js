import { executeQuery } from '../../db/connection.js';

/**
 * Obtiene los mensajes de un usuario específico.
 * @param {*} userId 
 * @returns 
 */
const getUserMessages = async (userId) => {
  const query = `
    SELECT 
      id, 
      message, 
      origin_user_id, 
      target_user_id, 
      created_at, 
      origin_key,
      target_key,
      CASE WHEN ? = origin_user_id THEN 1 ELSE 0 END AS sent
    FROM messages
    WHERE origin_user_id = ? OR target_user_id = ?;
  `;
  const [rows] = await executeQuery(query, [userId, userId, userId]);
  return rows;
};

/**
 * Obtiene los usuarios con los que se ha intercambiado mensajes individuales.
 * @param {*} userId 
 * @returns 
 */
const getUserContacts = async (userId) => {
  const query = `
    SELECT DISTINCT
      u.id,
      u.email,
      u.username,
      u.rsa_public_key
    FROM users u
    INNER JOIN messages m ON (u.id = m.origin_user_id OR u.id = m.target_user_id)
    WHERE (m.origin_user_id = ? OR m.target_user_id = ?) AND u.id != ?;
  `;
  const [rows] = await executeQuery(query, [userId, userId, userId]);
  return rows;
};


const insertMessage = async ({message, originUserId, targetUserId, originKey, targetKey}) => {
    const query = `
    INSERT INTO messages (message, origin_user_id, target_user_id, origin_key, target_key, created_at)
    VALUES (?, ?, ?, ?, ?, NOW());
    `;
    const [result] = await executeQuery(query, [message, originUserId, targetUserId, originKey, targetKey]);
    return result?.affectedRows === 1;
}

export { insertMessage, getUserMessages, getUserContacts };