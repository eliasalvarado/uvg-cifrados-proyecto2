import CustomError from "../../utils/customError.js";
import errorSender from "../../utils/errorSender.js"
import { getChatsList } from "./chat.model.js";
import { addBlock } from '../blockchain/blockchain.model.js';
import crypto from 'crypto';

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

  const { userId } = req.params;
  const { userId: to } = req.params;
  const { message } = req.body || {};
  const from = req.user.id;     // emisor autenticado (JWT)
  const { ciphertext, iv, sig } = req.body; 

   //  Calcular hash del ciphertext para la blockchain
  const msgHash = crypto.createHash('sha256')
                          .update(message)
                          .digest('hex');


  await addBlock({ from, to, msgHash, sig }); 
  console.log(`Enviando mensaje a ${userId}: ${message}`);

  // Emitir el mensaje al socket del usuario
  io.to(userId.toString()).emit('chat_message', { from: req.user.id, message, to: userId });

  res.sendStatus(200)
}

export {
  getChatsListController,
  sendMessageController,
}