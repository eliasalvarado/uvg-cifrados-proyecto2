import CustomError from "../../utils/customError.js";
import errorSender from "../../utils/errorSender.js"
import { getChatsList } from "./chat.model.js";

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

export {
  getChatsListController
}