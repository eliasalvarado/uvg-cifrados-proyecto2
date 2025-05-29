import CustomError from "../../utils/customError.js";
import errorSender from "../../utils/errorSender.js"
import { getChatsList } from "./chat.model.js";
import { io } from "../../sockets/ioInstance.js";
import { generateECDSAKeys } from "../../utils/cypher/ECDSA.js";
import { executeQuery } from '../../db/connection.js';

const verifyMessage = async (message) => {
  try {
    if (!message.hash || !message.signature) {
      return {
        isValid: false,
        status: 'LEGACY_MESSAGE',
        tampering: false,
        note: 'Mensaje anterior al sistema de seguridad'
      };
    }

    const computedHash = createMessageHash(
      message.message,
      message.timestamp,
      message.from,
      message.to
    );

    if (computedHash !== message.hash) {
      return {
        isValid: false,
        status: 'HASH_MISMATCH',
        tampering: true,
        note: 'El contenido del mensaje fue modificado'
      };
    }

    const senderKeys = await getUserKeys(message.from);

    const isSignatureValid = verifyMessageSignature(
      message.hash,
      message.signature,
      senderKeys.publicKey
    );

    if (!isSignatureValid) {
      return {
        isValid: false,
        status: 'INVALID_SIGNATURE',
        tampering: true,
        note: 'La firma del mensaje no es válida'
      };
    }

    return {
      isValid: true,
      status: 'VERIFIED',
      tampering: false,
      note: 'Mensaje verificado correctamente'
    };

  } catch (error) {
    console.error('Error verificando mensaje:', error);
    return {
      isValid: false,
      status: 'VERIFICATION_ERROR',
      tampering: false,
      note: 'Error durante la verificación'
    };
  }
};

const ensureUserHasKeys = async (req, res, next) => {
  try {

    const query = 'SELECT ecdsa_public_key FROM users WHERE id = ?';
    const [userKeys] = await executeQuery(query, [req.user.id]);

    if (!userKeys || !userKeys.public_key) {
      const newKeys = generateECDSAKeys();
      const query = 'UPDATE users SET ecdsa_private_key = ?, ecdsa_public_key = ? WHERE id = ?';
      await executeQuery(query, [encrypt(newKeys.privateKey), newKeys.publicKey, req.user.id]);
    }

    next();
  } catch (error) {
    console.error('Error verificando claves de usuario:', error);
    res.status(500).json({ error: 'Error de configuración de seguridad' });
  }
};

const verifySpecificMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const query = 'SELECT * FROM messages WHERE id = ?';
    const [message] = await executeQuery(query, [messageId]);

    const verification = await verifyMessage(message);

    res.status(200).json({
      messageId,
      verification,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Error verificando mensaje específico:', error);
    res.status(500).json({ error: 'Error verificando mensaje' });
  }
};

const getChatsListController = async (req, res) => {
  try {
    const userId = req.user && req.user.id;

    const chats = await getChatsList(userId);

    if (!chats || chats.length === 0) {
      throw new CustomError('No se encontraron mensajes.', 404);
    }

    const verifiedChats = await Promise.all(
      chats.map(async (chat) => {
        return {
          ...chat,
          messages: await Promise.all(
            chat.messages?.map(async (msg) => {
              const verification = await verifyMessage(msg);
              return {
                ...msg,
                verified: verification.isValid,
                securityStatus: verification.status,
                tampering: verification.tampering
              };
            }) || []
          )
        };
      })
    );

    res.status(200).send({
      ok: true,
      result: verifiedChats,
      security: {
        totalMessages: verifiedChats.reduce((acc, chat) => acc + (chat.messages?.length || 0), 0),
        verifiedMessages: verifiedChats.reduce((acc, chat) =>
          acc + (chat.messages?.filter(msg => msg.verified).length || 0), 0
        )
      }
    });

  } catch (ex) {
    console.log(ex);
    errorSender({ res, ex });
  }
};

const saveSecureMessage = async (messageData) => {

  const query = 'INSERT INTO messages (id, message, origin_user_id, target_user_id, created_at, timestamp, hash, signature) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)';
  await executeQuery(query, [
    messageData.id,
    messageData.message,
    messageData.from,
    messageData.to,
    messageData.timestamp,
    messageData.hash,
    messageData.signature
  ]);

  console.log('Mensaje guardado:', messageData.id);
};

const sendMessageController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    console.log(`Enviando mensaje seguro a ${userId}: ${message}`);

    const timestamp = Date.now();
    const fromUserId = req.user.id;
    const toUserId = parseInt(userId);

    // 1. Crear hash SHA-256 del mensaje
    const messageHash = createMessageHash(message, timestamp, fromUserId, toUserId);

    // 2. Obtener clave privada del usuario
    const userKeys = await getUserKeys(fromUserId);

    // 3. Firmar el hash con ECDSA
    const signature = signMessage(messageHash, userKeys.privateKey);

    // 4. Crear mensaje seguro
    const secureMessage = {
      id: crypto.randomUUID(),
      from: fromUserId,
      to: toUserId,
      message: message,
      timestamp: timestamp,
      hash: messageHash,
      signature: signature,
      verified: true
    };

    // 5. Guardar en base de datos
    await saveSecureMessage(secureMessage);

    // 6. Emitir mensaje seguro al socket
    io.to(userId.toString()).emit('chat_message', {
      from: req.user.id,
      message,
      to: userId,
      messageId: secureMessage.id,
      timestamp: timestamp,
      hash: messageHash,
      signature: signature,
      secure: true
    });

    console.log(`Mensaje seguro enviado - ID: ${secureMessage.id}`);
    res.sendStatus(200);

  } catch (error) {
    console.error('Error enviando mensaje seguro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createMessageHash = (message, timestamp, fromUserId, toUserId) => {
  const messageData = JSON.stringify({
    message,
    timestamp,
    from: fromUserId,
    to: toUserId
  });

  return crypto.createHash('sha256').update(messageData).digest('hex');
};

const signMessage = (messageHash, privateKey) => {
  const sign = crypto.createSign('SHA256');
  sign.update(messageHash);
  sign.end();

  return sign.sign(privateKey, 'hex');
};

const verifyMessageSignature = (messageHash, signature, publicKey) => {
  try {
    const verify = crypto.createVerify('SHA256');
    verify.update(messageHash);
    verify.end();

    return verify.verify(publicKey, signature, 'hex');
  } catch (error) {
    console.error('Error verificando firma:', error);
    return false;
  }
};

const getUserKeys = async (userId) => {
  const query = 'SELECT ecdsa_private_key, ecdsa_public_key FROM users WHERE id = ?';
  const [user] = await executeQuery(query, [userId]);

  return {
    privateKey: decrypt(user.private_key_encrypted),
    publicKey: user.public_key
  };

};

export {
  sendMessageController,
  getChatsListController,
  verifySpecificMessage,
  ensureUserHasKeys,
  verifyMessage
};