import CustomError from "../../utils/customError.js";
import errorSender from "../../utils/errorSender.js"
import { getChatsList } from "./chat.model.js";
import { io } from "../../sockets/ioInstance.js";

const getChatsListController= async (req, res) => {

   try{
        const userId = 1; // TODO: Cambiar por el id del usuario logueado
        const chats = await getChatsList(userId);
        if (!chats || chats.length === 0) {
            throw new CustomError('No se encontraron mensajes.', 404);
        }

        res.status(200).send({ ok: true, result: chats})

   }catch(ex){
    console.log(ex)
        errorSender({res, ex })
   }
}

const sendMessageController = async (req, res) => {

  try{

    
    const { userId } = req.params;
    const { message } = req.body || {};
    
    if (!message){
      throw new CustomError('El mensaje es requerido', 400);
    }
    
    // Emitir el mensaje al socket del usuario
    io.to(userId.toString()).emit('chat_message', { from: req.user.id, message, to: parseInt(userId, 10), sent: false, datetime: new Date() });
    
    res.send({ ok: true })
  }catch(ex){
    console.log(ex)
    errorSender({res, ex })
  }
}

export {
  getChatsListController,
  sendMessageController,
}