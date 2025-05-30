import { createContext, useState } from 'react';
import PropTypes from 'prop-types';


const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  
  const [messages, setMessages] = useState([]);
  

  const data = {
    messages,
    setMessages
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
