import { createContext,  useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import useToken from '../hooks/useToken';
import { io } from 'socket.io-client';
import useAddReceivedMessage from '../hooks/simpleChat/useAddReceivedMessage';
import getTokenPayload from '../helpers/getTokenPayload';
import useAddReceivedGroupMessage from '../hooks/groupChat/useAddReceivedGroupMessage';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {

  const token = useToken();
  const socketRef = useRef(null);
  const addReceivedMessage = useAddReceivedMessage();
  const addReceivedGroupMessage = useAddReceivedGroupMessage();


  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      return;
    }

    const tokenPayload = getTokenPayload(token);

    // crear socket con autenticación
    socketRef.current = io('http://localhost:3000', {
      auth: { token },
    });

    const socket = socketRef.current;

    console.log('Connecting to socket with user ID:');

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('chat_message', async (data) => {
      console.log('Received chat message:', data);
      addReceivedMessage(data);
      
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Error de conexión socket:', err.message);
    });

    socket.on('chat_group_message', (data) => {
      const userId = tokenPayload.id;
      if(data.userId === userId) {
        return; // No procesar mensajes enviados por el usuario actual
      }
      addReceivedGroupMessage(data);
      console.log('Received group chat message:', data);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('chat_message');
      socket.disconnect(); // desconectar socket al desmontar
    };
  }, [token]);

  

  const data = {
    socket: socketRef.current
  };

  return (
    <SocketContext.Provider value={data}>
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SocketContext;
