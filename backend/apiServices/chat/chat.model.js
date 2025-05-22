import { executeQuery } from '../../db/connection.js';

const getChatsList = async (userId) => {
    const query = `
    SELECT u.id AS user_id, u.username, m.id AS message_id, m.message 
    FROM messages m INNER JOIN users u ON m.target_user_id = u.id
    WHERE m.origin_user_id = ?`;
    const [rows] = await executeQuery(query, [userId]);
    return rows;
}

export {getChatsList}