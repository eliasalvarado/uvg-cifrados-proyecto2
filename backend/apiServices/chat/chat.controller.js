import CustomError from "../../utils/customError.js";
import errorSender from "../../utils/errorSender.js"
import { getGroupByName, getUserContacts, getUserMessages, insertGroup, insertGroupMember, insertGroupMessage, insertMessage, verifyIfUserIsGroupMember } from "./chat.model.js";
import { io } from "../../sockets/ioInstance.js";
import generateAES256KeyBase64 from "../../../frontend/src/helpers/cypher/generateAES256KeyBase64.js";


const sendMessageController = async (req, res) => {

  try{

    
    const { userId } = req.params;
    const { message, originKey, targetKey } = req.body || {};
    
    if (!message){
      throw new CustomError('El mensaje es requerido', 400);
    }

    if (!originKey){
      throw new CustomError('La llave de origen es requerida', 400);
    }

    if (!targetKey){
      throw new CustomError('La llave de destino es requerida', 400);
    }

    // Guardar el mensaje en la base de datos
    const ok = await insertMessage({
      message,
      originUserId: req.user.id,
      targetUserId: parseInt(userId, 10),
      originKey,
      targetKey
    });

    if (!ok) {
      throw new CustomError('No se pudo guardar el mensaje', 500);
    }
    
    // Emitir el mensaje al socket del usuario
    io.to(userId.toString()).emit('chat_message', {
      from: req.user.id,
      message: message?.toString(),
      to: parseInt(userId, 10),
      sent: false,
      datetime: new Date(),
      targetKey,
    });
    
    res.send({ ok: true })
  }catch(ex){
    console.log(ex)
    errorSender({res, ex })
  }
}

const getSingleChatsController = async (req, res) => {
  try {
    console.log("holis")
    const userId = req.user.id;
    const contacts = await getUserContacts(userId);
    const messages = await getUserMessages(userId);
    
    
    res.send({ ok: true, contacts, messages });
  } catch (ex) {
    console.log("Error: ",ex);
    errorSender({ res, ex });
  }
}

const createGroupController = async (req, res) => {
  try {
    const { name } = req.body ?? {};
    if (!name) {
      throw new CustomError('El nombre del grupo es requerido', 400);
    }

    // Generar llave del grupo
    const keyBase64 = generateAES256KeyBase64();
    
    const groupId = await insertGroup({
      name,
      creatorId: req.user.id,
      key: keyBase64
    });

    if (!groupId) {
      throw new CustomError('No se pudo crear el grupo', 500);
    }

    // Añadir al creador del grupo como miembro
    const memberAdded = await insertGroupMember({
      groupId: groupId,
      userId: req.user.id
    });
    if (!memberAdded) {
      throw new CustomError('No se pudo añadir al creador como miembro del grupo', 500);
    }

    res.send({ ok: true, groupId, name, creatorId: req.user.id, key: keyBase64 });
  } catch (ex) {
    console.log(ex);
    errorSender({ res, ex });
  }
}

const joinGroupController = async (req, res) => {
  try {
    const { groupName } = req.body ?? {};
    if (!groupName) {
      throw new CustomError('El parámetro groupName es requerido', 400);
    }

    const {groupId, key} = await getGroupByName(groupName) ?? {};
    if (!groupId) {
      throw new CustomError(`No se encontró el grupo con nombre "${groupName}"`, 404);
    }

    const memberAdded = await insertGroupMember({
      groupId: parseInt(groupId, 10),
      userId: req.user.id
    });

    if (!memberAdded) {
      throw new CustomError('No se pudo añadir al usuario como miembro del grupo', 500);
    }

    res.send({ ok: true, groupId, name: groupName, newMemberId: req.user.id, key });
  } catch (ex) {
    console.log(ex);
    errorSender({ res, ex });
  }
}

const sendGroupMessageController = async (req, res) => {

  try{

    const { groupId } = req.params;
    const { message, key } = req.body ?? {};
    const userId = req.user.id;
    
    if (!message){
      throw new CustomError('El mensaje es requerido', 400);
    }

    const groupIdInt = parseInt(groupId, 10);
    // Verificar que el usuario es miembro del grupo
    const isMember = await verifyIfUserIsGroupMember(groupId, req.user.id);
    if (!isMember) {
      throw new CustomError('El usuario no es miembro del grupo', 403);
    }

    // Guardar el mensaje en la base de datos
    const ok = await insertGroupMessage({
      message,
      groupId: groupIdInt,
      userId,
    })

    if (!ok) {
      throw new CustomError('No se pudo guardar el mensaje de grupo', 500);
    }

    // Emitir al room del grupo
    io.to(`group_${groupIdInt}`).emit('chat_group_message', {
      message: message?.toString(),
      groupId: groupIdInt,
      userId,
      sent: false,
      datetime: new Date(),
    });
    
    
    res.send({ ok: true })
  }catch(ex){
    console.log(ex)
    errorSender({res, ex })
  }
}

export {
  sendMessageController,
  getSingleChatsController,
  createGroupController,
  joinGroupController,
  sendGroupMessageController
}