import { useContext } from 'react';
import ChatContext from '../context/ChatContext';

function useChatState() {

const {messages, setMessages, users, setUsers} = useContext(ChatContext);
    console.log("Mensajes actuales: ",messages)
    /**
     * 
     * @param {*} message Expects a messageObject.
     */
    const addSingleChatMessage = (message) => {
        // Check the user ID based on whether the message was sent or received
        const userId = message.sent ? message.to : message.from;
        setMessages((prevMessages) => {
            const userMessages = prevMessages[userId] || [];
            return {
                ...prevMessages,
                [userId]: [...userMessages, message]
            };
        });
    }

    /**
     * 
     * @param {*} from: The user ID of the sender
     * @param {*} to: The user ID of the receiver
     * @param {*} message: The message content
     * @param {*} datetime: The date and time when the message was sent
     * @param {*} sent: Boolean indicating if the message was sent by the current user
     * @returns 
     */
    const getMessageObject = ({from, to, message, datetime, sent }) => ({
      from,
      to,
      message,
      datetime,
      sent
    })
    
    const addUser = ({userId, username, email, rsaPublicKey}) => {
        setUsers((prev) => {
            if (prev[userId]) return prev; // If user already exists, do nothing
            return { ...prev, [userId]: { username, email, rsaPublicKey } };
        });
    }

    /**
     * Crea un nuevo chat con un contacto si no existe previamente.
     * @param {string} userId - El ID del usuario con el que se quiere crear un chat.
     * 
     */
    const createEmptyChat = ({userId, username, email, rsaPublicKey }) =>{
        setMessages((prev) => {
          if (prev[userId]) return prev;
          return { ...prev, [userId]: [] };
         });

         addUser({userId, username, email, rsaPublicKey});
    }
        

    return {
        messages,
        users,
        addSingleChatMessage,
        getMessageObject,
        createEmptyChat,
        addUser,
    };
}

export default useChatState;
