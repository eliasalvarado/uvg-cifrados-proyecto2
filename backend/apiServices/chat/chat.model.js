import { userInfo } from 'os';
import { executeQuery } from '../../db/connection.js';
import CustomError from '../../utils/customError.js';
import {verifySignature} from '../../utils/cypher/ECDSA.js'

/**
 * Obtiene los mensajes de un usuario específico.
 * @param {*} userId 
 * @returns 
 */
const getUserMessages = async (userId) => {
  const query = `
    SELECT 
      m.id, 
      m.message, 
      m.origin_user_id, 
      m.target_user_id, 
      m.created_at, 
      m.origin_key,
      m.target_key,
      CASE WHEN ? = m.origin_user_id THEN 1 ELSE 0 END AS sent,
      m.signature,
      u.ecdsa_public_key as signature_key
    FROM messages m
    INNER JOIN users u ON m.origin_user_id = u.id
    WHERE origin_user_id = ? OR target_user_id = ?;
  `;
  try {
    const [rows] = await executeQuery(query, [userId, userId, userId]);
    
    const messages = rows.map(row => {
      // Verificar firmas
      const isValid = verifySignature(row.message, row.signature?.replaceAll("\n","").replaceAll(" ",""), row.signature_key);
      return { ...row, isValid, signature_key: undefined };
    });

    console.log("Messages", messages);

    return messages;

  } catch (err) {
    console.error("Error al obtener mensajes:", err);
    return [];
  }
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


const insertMessage = async ({message, originUserId, targetUserId, originKey, targetKey, signature}) => {
    const query = `
    INSERT INTO messages (message, origin_user_id, target_user_id, origin_key, target_key, created_at, signature)
    VALUES (?, ?, ?, ?, ?, NOW(), ?);
    `;
    const [result] = await executeQuery(query, [message, originUserId, targetUserId, originKey, targetKey, signature]);
    return result?.affectedRows === 1;
}

const insertGroupMessage = async ({message, groupId, userId, signature}) => {
    const query = `
    INSERT INTO group_messages (message, group_id, user_id, created_at, signature)
    VALUES (?, ?, ?, NOW(),?);
    `;
    const [result] = await executeQuery(query, [message, groupId, userId, signature]);
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

const getGroupsIdForUser = async (userId) => {
  const query = `
    SELECT g.id
    FROM \`groups\` g
    INNER JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = ?;
  `;
  const [rows] = await executeQuery(query, [userId]);
  return rows.map(row => row.id);
}

const getGroupsForUser = async (userId) => {
  const query = `
    SELECT 
      g.id AS groupId,
      g.name,
      g.key,
      g.creator_id AS creatorId,
      gm2.user_id AS memberId
    FROM \`groups\` g
    JOIN group_members gm ON g.id = gm.group_id
    JOIN group_members gm2 ON g.id = gm2.group_id 
    WHERE gm.user_id = ?
    ORDER BY g.id;
  `;

  const [rows] = await executeQuery(query, [userId]);

  // Agrupar los resultados por groupId
  const groupsMap = new Map();

  rows.forEach(({ groupId, name, key, creatorId, memberId }) => {
    if (!groupsMap.has(groupId)) {
      groupsMap.set(groupId, {
        groupId,
        name,
        key,
        creatorId,
        members: []
      });
    }
    groupsMap.get(groupId).members.push(memberId);
  });

  return Array.from(groupsMap.values());
};

const getUserGroupMessages = async (userId) => {
  const query = `
    SELECT 
      gm.id,
      message, 
      gm.group_id, 
      gm.user_id, 
      gm.created_at, 
      CASE WHEN ? = gm.user_id THEN 1 ELSE 0 END AS sent,
      u.username,
      signature,
      u.ecdsa_public_key as signature_key
    FROM group_messages gm
    JOIN group_members gmem ON gm.group_id = gmem.group_id
    JOIN users u ON gm.user_id = u.id
    WHERE gmem.user_id = ?
    ORDER BY gm.group_id, gm.created_at
  `;
  try{
    const [rows] = await executeQuery(query, [userId, userId]);

    const messages = rows.map(row => {
      const isValid = verifySignature(row.message, row.signature?.replaceAll("\n","").replaceAll(" ",""), row.signature_key);
      return ({
      id: row.id,
      message: row.message,
      groupId: row.group_id,
      userId: row.user_id,
      datetime: row.created_at,
      sent: row.sent === 1,
      username: row.username,
      isValid,
      signature_key: undefined
    })});

    return messages;
  } catch (err) {
    return [];
  }
};



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
  getGroupsIdForUser,
  getGroupsForUser,
  getUserGroupMessages,
};