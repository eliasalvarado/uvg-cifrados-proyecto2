import { executeQuery } from '../../db/connection.js';
import CustomError from '../../utils/customError.js';
import { verifySignature } from '../../utils/cypher/ECDSA.js'
import errorSender from '../../utils/errorSender.js';

/* ──────────────────────────────── Validaciones ──────────────────────────────── */

/**
 * Valida que un ID sea un número entero positivo
 */
const validateId = (id, fieldName = 'ID') => {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    throw new CustomError(`${fieldName} inválido`, 400);
  }
  return numId;
};

/**
 * Valida y sanitiza un mensaje
 */
const validateMessage = (message) => {
  if (typeof message !== 'string') {
    throw new CustomError('El mensaje debe ser texto', 400);
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    throw new CustomError('El mensaje no puede estar vacío', 400);
  }

  if (trimmed.length > 10000) { // 10KB límite
    throw new CustomError('El mensaje es demasiado largo (máx 10,000 caracteres)', 400);
  }

  return trimmed;
};

/**
 * Valida un nombre de grupo
 */
const validateGroupName = (name) => {
  if (typeof name !== 'string') {
    throw new CustomError('El nombre del grupo debe ser texto', 400);
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    throw new CustomError('El nombre del grupo no puede estar vacío', 400);
  }

  if (trimmed.length > 100) {
    throw new CustomError('El nombre del grupo es demasiado largo (máx 100 caracteres)', 400);
  }

  // Prevenir caracteres especiales peligrosos
  if (!/^[a-zA-Z0-9\s\-_áéíóúñÁÉÍÓÚÑ]+$/.test(trimmed)) {
    throw new CustomError('El nombre del grupo contiene caracteres no permitidos', 400);
  }

  return trimmed;
};

/**
 * Valida una clave criptográfica
 */
const validateKey = (key, keyType = 'Clave') => {
  if (typeof key !== 'string') {
    throw new CustomError(`${keyType} inválida`, 400);
  }

  const trimmed = key.trim();

  if (trimmed.length === 0) {
    throw new CustomError(`${keyType} no puede estar vacía`, 400);
  }

  if (trimmed.length > 5000) {
    throw new CustomError(`${keyType} demasiado larga`, 400);
  }

  return trimmed;
};

/**
 * Valida una firma digital
 */
const validateSignature = (signature) => {
  if (!signature) {
    return null; // Firma opcional
  }

  if (typeof signature !== 'string') {
    throw new CustomError('Firma inválida', 400);
  }

  const trimmed = signature.trim();

  if (trimmed.length > 1000) {
    throw new CustomError('Firma demasiado larga', 400);
  }

  return trimmed;
};

/**
 * Sanitiza una firma (elimina espacios y saltos de línea)
 */
const sanitizeSignature = (signature) => {
  if (!signature) return null;
  return signature.replace(/[\n\s]/g, '');
};

/* ──────────────────────────────── Funciones ──────────────────────────────── */

/**
 * Obtiene los mensajes de un usuario específico.
 * @param {*} userId 
 * @returns 
 */
const getUserMessages = async (userId) => {
  try {
    const validUserId = validateId(userId, 'ID de usuario');

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
    WHERE origin_user_id = ? OR target_user_id = ?
    ORDER BY m.created_at DESC
    LIMIT 1000;
  `;
    const [rows] = await executeQuery(query, [validUserId, validUserId, validUserId]);

    const messages = rows.map(row => {
      // Verificar firmas
      let isValid = false;
      try {
        const cleanSignature = sanitizeSignature(row.signature);
        isValid = verifySignature(row.message, cleanSignature, row.signature_key);
      } catch (err) {
        // Si la verificación falla, isValid queda en false
        console.error('Error verificando firma:', err.message);
      }

      return {
        ...row,
        isValid,
        signature_key: undefined // No exponer la clave en la respuesta
      };
    });

    // console.log("Messages", messages);

    return messages;
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    }
    errorSender({ res: null, ex: err, defaultError: 'Error al obtener mensajes.' });
    throw new CustomError('Error al obtener mensajes', 500);
  }
};

/**
 * Obtiene los usuarios con los que se ha intercambiado mensajes individuales.
 * @param {*} userId 
 * @returns 
 */
const getUserContacts = async (userId) => {
  try {
    const validUserId = validateId(userId, 'ID de usuario');
    const query = `
    SELECT DISTINCT
      u.id,
      u.email,
      u.username,
      u.rsa_public_key
    FROM users u
    INNER JOIN messages m ON (u.id = m.origin_user_id OR u.id = m.target_user_id)
    WHERE (m.origin_user_id = ? OR m.target_user_id = ?) AND u.id != ?
    LIMIT 500;
  `;
    const [rows] = await executeQuery(query, [validUserId, validUserId, validUserId]);
    return rows;
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    }
    errorSender({ res: null, ex: err, defaultError: 'Error al obtener contactos.' });
    throw new CustomError('Error al obtener contactos', 500);
  }
};

/**
 * Inserta un mensaje individual
 */
const insertMessage = async ({ message, originUserId, targetUserId, originKey, targetKey, signature }) => {
  try {
    const validMessage = validateMessage(message);
    const validOriginId = validateId(originUserId, 'ID origen');
    const validTargetId = validateId(targetUserId, 'ID destino');
    const validOriginKey = validateKey(originKey, 'Clave origen');
    const validTargetKey = validateKey(targetKey, 'Clave destino');
    const validSignature = validateSignature(signature);

    // Verificar que origen y destino sean diferentes
    if (validOriginId === validTargetId) {
      throw new CustomError('No puedes enviarte mensajes a ti mismo', 400);
    }

    console.log("Inserting message from", validOriginId, "to", validTargetId);

    const query = `
    INSERT INTO messages (message, origin_user_id, target_user_id, origin_key, target_key, created_at, signature)
    VALUES (?, ?, ?, ?, ?, NOW(), ?);
    `;

    const[result] = await executeQuery(query, [
      validMessage,
      validOriginId,
      validTargetId,
      validOriginKey,
      validTargetKey,
      validSignature
    ]);

    return result?.affectedRows === 1;
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    }
    errorSender({ res: null, ex: err, defaultError: 'Error al insertar mensaje.' });
    throw new CustomError('Error al insertar mensaje', 500);
  }
}

/**
 * Inserta un mensaje en un grupo
 */
const insertGroupMessage = async ({ message, groupId, userId, signature }) => {
  try {
    const validMessage = validateMessage(message);
    const validGroupId = validateId(groupId, 'ID de grupo');
    const validUserId = validateId(userId, 'ID de usuario');
    const validSignature = validateSignature(signature);

    const query = `
    INSERT INTO group_messages (message, group_id, user_id, created_at, signature)
    VALUES (?, ?, ?, NOW(),?);
    `;
    const [result] = await executeQuery(query, [
      validMessage,
      validGroupId,
      validUserId,
      validSignature
    ]);
    return result?.affectedRows === 1;
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    }
    errorSender({ res: null, ex: err, defaultError: 'Error al insertar mensaje grupal.' });
    throw new CustomError('Error al insertar mensaje grupal', 500);
  }
}

/**
 * Crea un nuevo grupo
 */
const insertGroup = async ({ name, creatorId, key }) => {
  try {
    const validName = validateGroupName(name);
    const validCreatorId = validateId(creatorId, 'ID creador');
    const validKey = validateKey(key, 'Clave del grupo');

    const query = `
    INSERT INTO \`groups\` (\`name\`, creator_id, \`key\`)
    VALUES (?, ?, ?);
  `;

    const [result] = await executeQuery(query, [validName, validCreatorId, validKey]);


    // Retorna el ID del nuevo grupo
    if (result?.affectedRows === 1) {
      return result.insertId;
    }

    throw new CustomError('No se pudo crear el grupo.', 500);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new CustomError(`El grupo con nombre "${name}" ya existe.`, 409);
    }
    if (error instanceof CustomError) {
      throw error;
    }
    errorSender({ res: null, ex: error, defaultError: 'Error al crear el grupo.' });
    throw new CustomError('Error al crear el grupo', 500);
  }
};

/**
 * Añade un miembro a un grupo
 */
const insertGroupMember = async ({ groupId, userId }) => {
  try {
    const validGroupId = validateId(groupId, 'ID de grupo');
    const validUserId = validateId(userId, 'ID de usuario');

    const query = `
    INSERT INTO group_members (group_id, user_id)
    VALUES (?, ?);
  `;

    const [result] = await executeQuery(query, [validGroupId, validUserId]);

    // Verificamos si se insertó correctamente
    return result?.affectedRows === 1;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new CustomError('El usuario ya es miembro del grupo.', 409);
    }
    if (error instanceof CustomError) {
      throw error;
    }
    errorSender({ res: null, ex: error, defaultError: 'Error al añadir miembro al grupo.' });
    throw new CustomError('Error al añadir miembro al grupo', 500);
  }
};

/**
 * Obtiene un grupo por nombre
 */
const getGroupByName = async (groupName) => {
  try {
    const validName = validateGroupName(groupName);

    const query = `
    SELECT id, name, \`key\`, creator_id FROM \`groups\` WHERE name = ?;
  `;
    const [rows] = await executeQuery(query, [validName]);

    return rows.length > 0 ? {
      groupId: rows[0].id,
      name: rows[0].name,
      key: rows[0].key,
      creatorId: rows[0].creator_id
    } : null;
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    }
    errorSender({ res: null, ex: err, defaultError: 'Error al buscar grupo.' });
    throw new CustomError('Error al buscar grupo', 500);
  }
};

/**
 * Verifica si un usuario es miembro de un grupo
 */
const verifyIfUserIsGroupMember = async (groupId, userId) => {
  try {
    const validGroupId = validateId(groupId, 'ID de grupo');
    const validUserId = validateId(userId, 'ID de usuario');

    const query = `
    SELECT COUNT(*) AS count
    FROM group_members
    WHERE group_id = ? AND user_id = ?;
  `;

    const [rows] = await executeQuery(query, [validGroupId, validUserId]);
    return rows[0].count > 0;
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    }
    errorSender({ res: null, ex: err, defaultError: 'Error al verificar membresía.' });
    throw new CustomError('Error al verificar membresía', 500);
  }
}

/**
 * Obtiene los IDs de miembros de un grupo
 */
const getGroupMembersId = async (groupId) => {
  try {
    const validGroupId = validateId(groupId, 'ID de grupo');

    const query = `
    SELECT user_id
    FROM group_members
    WHERE group_id = ?;
  `;
    const [rows] = await executeQuery(query, [validGroupId]);
    return rows.map(row => row.user_id);
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    }
    errorSender({ res: null, ex: err, defaultError: 'Error al obtener miembros.' });
    throw new CustomError('Error al obtener miembros', 500);
  }
};

/**
 * Obtiene los IDs de grupos de un usuario
 */
const getGroupsIdForUser = async (userId) => {
  try {
    const validUserId = validateId(userId, 'ID de usuario');

    const query = `
    SELECT g.id
    FROM \`groups\` g
    INNER JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = ?
    LIMIT 500;
  `;

    const [rows] = await executeQuery(query, [validUserId]);
    return rows.map(row => row.id);
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    }
    errorSender({ res: null, ex: err, defaultError: 'Error al obtener grupos.' });
    throw new CustomError('Error al obtener grupos', 500);
  }
};

/**
 * Obtiene los grupos de un usuario con sus miembros
 */
const getGroupsForUser = async (userId) => {
  try {
    const validUserId = validateId(userId, 'ID de usuario');

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
    ORDER BY g.id
    LIMIT 5000;
  `;

    const [rows] = await executeQuery(query, [validUserId]);

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
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    }
    errorSender({ res: null, ex: err, defaultError: 'Error al obtener grupos.' });
    throw new CustomError('Error al obtener grupos', 500);
  }
};

/**
 * Obtiene mensajes grupales de un usuario
 */
const getUserGroupMessages = async (userId) => {
  try {
    const validUserId = validateId(userId, 'ID de usuario');

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

    const [rows] = await executeQuery(query, [validUserId, validUserId]);

    const messages = rows.map(row => {
      let isValid = false;
      try {
        const cleanSignature = sanitizeSignature(row.signature);
        isValid = verifySignature(row.message, cleanSignature, row.signature_key);
      } catch (err) {
        console.error('Error verificando firma grupal:', err.message);
      }

      return {
        id: row.id,
        message: row.message,
        groupId: row.group_id,
        userId: row.user_id,
        datetime: row.created_at,
        sent: row.sent === 1,
        username: row.username,
        isValid,
        signature_key: undefined
      };
    });

    return messages;
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    }
    errorSender({ res: null, ex: err, defaultError: 'Error al obtener mensajes grupales.' });
    throw new CustomError('Error al obtener mensajes grupales', 500);
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