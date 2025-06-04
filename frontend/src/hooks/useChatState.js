import { useContext } from 'react';
import ChatContext from '../context/ChatContext';

import getUserObject from '../helpers/dto/getUserObject';
import getGroupObject from '../helpers/dto/getGroupObject';

function useChatState() {

    const {messages, setMessages, users, setUsers, setGroups, groups, groupMessages } = useContext(ChatContext);



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

    
    const addUser = ({userId, username, email, rsaPublicKey}) => {
        setUsers((prev) => {
            if (prev[userId]) return prev; // If user already exists, do nothing
            return { ...prev, [userId]: getUserObject({userId, username, email, rsaPublicKey}) };
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

    const createEmptyGroup = ({groupId, name, creatorId, key}) => {
        const groupObj = getGroupObject({name, members: [creatorId], key});
        setGroups((prev) => {
            if (prev[groupId]) return prev; // If group already exists, do nothing
            return { ...prev, [groupId]: groupObj };
        });
    }
        

    return {
        messages,
        users,
        groups,
        groupMessages,
        addSingleChatMessage,
        createEmptyChat,
        addUser,
        createEmptyGroup,
    };
}

export default useChatState;
