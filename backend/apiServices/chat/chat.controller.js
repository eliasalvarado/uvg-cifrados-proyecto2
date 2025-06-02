import CustomError from "../../utils/customError.js";
import errorSender from "../../utils/errorSender.js"
import { getUserContacts, getUserMessages, insertMessage } from "./chat.model.js";
import { io } from "../../sockets/ioInstance.js";


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

export {
  sendMessageController,
  getSingleChatsController
}