import { useEffect, useRef } from 'react';
import getTokenPayload from '../helpers/getTokenPayload';
import useToken from './useToken';
import { io } from 'socket.io-client';
import useChatState from './useChatState';

function useSocket() {
  
  const token = useToken();
  const socketRef = useRef(null);
  const { addMessage } = useChatState();

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      return;
    }

    const userData = getTokenPayload(token);
    if (!userData) {
      console.error('Invalid token');
      return;
    }

    // crear socket con autenticación
    socketRef.current = io('http://localhost:3000', {
      auth: { token },
    });

    const socket = socketRef.current;

    console.log('Connecting to socket with user ID:', userData.id);

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('chat_message', (data) => {
        console.log('Received chat message:', data);
      if (data.to === userData.id) {
        console.log('Mensaje recibido:', data.message);
        // Aquí podrías actualizar tu estado con el nuevo mensaje
        addMessage(data)
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
        console.error('Error de conexión socket:', err.message);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('chat_message');
      socket.disconnect(); // desconectar socket al desmontar
    };
  }, [token]); // [ idUsuario: [{id, message}, {id, message}, ...], ...]


}

export default useSocket;
