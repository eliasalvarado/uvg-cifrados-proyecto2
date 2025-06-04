import { executeQuery } from '../../db/connection.js';
import CustomError from '../../utils/customError.js';

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

const insertGroup = async ({ name, creatorId }) => {
  console.log('insertGroup', { name, creatorId });
  const query = `
    INSERT INTO \`groups\` (\`name\`, creator_id)
    VALUES (?, ?);
  `;

  try {
    const [result] = await executeQuery(query, [name, creatorId]);

    // Retorna el ID del nuevo grupo
    if (result?.affectedRows === 1) {
      return result.insertId;
    }

    throw new CustomError('No se pudo crear el grupo.', 500);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new CustomError(`El grupo con nombre "${name}" ya existe.`, 409);
    }
    throw error;
  }
};



const insertGroupMember = async ({ groupId, userId }) => {
  const query = `
    INSERT INTO group_members (group_id, user_id)
    VALUES (?, ?);
  `;

  try {
    const [result] = await executeQuery(query, [groupId, userId]);

    // Verificamos si se insertó correctamente
    return result?.affectedRows === 1;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new CustomError('El usuario ya es miembro del grupo.', 409);
    }
    throw error;
  }
};

const getGroupIdByName = async (groupName) => {
  const query = `
    SELECT id FROM \`groups\` WHERE name = ?;
  `;
  const [rows] = await executeQuery(query, [groupName]);
  return rows.length > 0 ? rows[0].id : null;
};


export { insertMessage, getUserMessages, getUserContacts, insertGroup, insertGroupMember, getGroupIdByName};