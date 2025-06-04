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

const insertGroupMessage = async ({message, groupId, userId}) => {
    const query = `
    INSERT INTO group_messages (message, group_id, user_id, created_at)
    VALUES (?, ?, ?, NOW());
    `;
    const [result] = await executeQuery(query, [message, groupId, userId]);
    return result?.affectedRows === 1;
}

const insertGroup = async ({ name, creatorId, key }) => {
  const query = `
    INSERT INTO \`groups\` (\`name\`, creator_id, \`key\`)
    VALUES (?, ?, ?);
  `;

  try {
    const [result] = await executeQuery(query, [name, creatorId, key]);

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

const getGroupByName = async (groupName) => {
  const query = `
    SELECT id, name, \`key\`, creator_id FROM \`groups\` WHERE name = ?;
  `;
  const [rows] = await executeQuery(query, [groupName]);
  
  return rows.length > 0 ? {
    groupId: rows[0].id,
    name: rows[0].name,
    key: rows[0].key,
    creatorId: rows[0].creator_id
  } : null;
};

const verifyIfUserIsGroupMember = async (groupId, userId) => {
  const query = `
    SELECT COUNT(*) AS count
    FROM group_members
    WHERE group_id = ? AND user_id = ?;
  `;
  const [rows] = await executeQuery(query, [groupId, userId]);
  return rows[0].count > 0;
}

const getGroupMembersId = async (groupId) => {
  const query = `
    SELECT user_id
    FROM group_members
    WHERE group_id = ?;
  `;
  const [rows] = await executeQuery(query, [groupId]);
  return rows.map(row => row.user_id);
};

const getGroupsForUser = async (userId) => {
  const query = `
    SELECT g.id, g.key
    FROM \`groups\` g
    INNER JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = ?;
  `;
  const [rows] = await executeQuery(query, [userId]);
  return rows.map(row => ({id:row.id, key:row.key}));
}



export {
  insertMessage,
  getUserMessages,
  getUserContacts,
  insertGroup,
  insertGroupMember,
  getGroupByName,
  insertGroupMessage,
  verifyIfUserIsGroupMember,
  getGroupMembersId,
  getGroupsForUser,
};