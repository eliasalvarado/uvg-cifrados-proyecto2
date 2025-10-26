import { createContext, useState , useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import useGetSingleChats from '../hooks/simpleChat/useGetSingleChats';
import useToken from '../hooks/useToken';
import useGetGroups from '../hooks/groupChat/useGetGroups';

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
  const { getGroups, result: groupsResult } = useGetGroups();
  const token = useToken();


  useEffect(() => {
    
    if (!token) return;
    
    console.log("INICIALIZANDO CHAT");
    // Inicializar la información de los chats
    getSingleChats();
    getGroups();

  }, [token]);

  useEffect(() => {

    if (!singleChatsResult) return;
    const { contacts, messages } = singleChatsResult;

    setMessages(messages);
    setUsers(contacts);

  }, [singleChatsResult]);

  useEffect(() => {
    if (!groupsResult) return;
    const { groups, messages } = groupsResult;

    setGroups(groups);
    setGroupMessages(messages);

  }, [groupsResult]);

  const data = useMemo(() => ({
    messages,
    setMessages,
    users,
    setUsers,
    groups,
    setGroups,
    groupMessages,
    setGroupMessages,
  }), [messages, users, groups, groupMessages]);

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
