import { createContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import useGetSingleChats from '../hooks/simpleChat/useGetSingleChats';
import useToken from '../hooks/useToken';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

  // Variables para manejar el estado del chat
  const [messages, setMessages] = useState({});
  const [users, setUsers] = useState({});

  // Variables para manejar estado de grupos
  const [groups, setGroups] = useState({}); // { groupId: { name, members:[userId, ...] } }
  const [groupMessages, setGroupMessages] = useState({}); // { groupId: [groupMessageObject, ...] }

  // Hooks para obtener estado inicial
  const {getSingleChats, result: singleChatsResult } = useGetSingleChats();
  const token = useToken();


  useEffect(() => {
    
    if (!token) return;
    
    console.log("INICIALIZANDO CHAT");
    // Inicializar la información de los chats
    getSingleChats();

  }, [token]);

  useEffect(() => {

    if (!singleChatsResult) return;
    const { contacts, messages } = singleChatsResult;

    setMessages(messages);
    setUsers(contacts);

  }, [singleChatsResult]);

  const data = {
    messages,
    setMessages,
    users,
    setUsers,
    groups,
    setGroups,
    groupMessages,
    setGroupMessages,
  };

  return (
    <ChatContext.Provider value={data}>
      {children}
    </ChatContext.Provider>
  );
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ChatContext;
