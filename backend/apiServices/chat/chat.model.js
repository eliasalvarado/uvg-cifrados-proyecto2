import { executeQuery } from '../../db/connection.js';

const getChatsList = async (userId) => {
    const query = `
    WITH ranked AS (
    SELECT *,
        ROW_NUMBER() OVER (
        PARTITION BY LEAST(origin_user_id, target_user_id), GREATEST(origin_user_id, target_user_id)
        ORDER BY created_at DESC
        ) AS rn,
        CASE 
        WHEN origin_user_id = ? THEN target_user_id
        ELSE origin_user_id
        END AS other_user_id
    FROM messages
    WHERE origin_user_id = ? OR target_user_id = ?
    )
    SELECT 
    u.id AS user_id,
    u.username,
    r.id AS message_id,
    r.message,
    r.created_at
    FROM ranked r
    JOIN users u ON u.id = r.other_user_id
    WHERE r.rn = 1
    ORDER BY r.created_at DESC;
    `;
    const [rows] = await executeQuery(query, [userId, userId, userId]);
    return rows;
}

export {getChatsList}