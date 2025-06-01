import { useEffect, useRef } from 'react';
import getTokenPayload from '../helpers/getTokenPayload';
import useToken from './useToken';
import { io } from 'socket.io-client';
import useChatState from './useChatState';
import useGetUserById from './user/useGetUserById';

function useSocket() {
  
  const token = useToken();
  const socketRef = useRef(null);

  const { addSingleChatMessage, users, addUser } = useChatState();
  const { getUserById, result: userResult } = useGetUserById();

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
        console.log('Received chat message:', data, "for user:", userData.id);
      if (data.to === userData.id) {
        addSingleChatMessage(data);

        // Si el usuario no existe, agregarlo
        if (data.from && !users[data.from]) {
          getUserById(data.from) 
        }
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

  useEffect(() => {
    if (!userResult) return;

    if (users[userResult.id]) return;

    addUser({
      userId: userResult.id,
      username: userResult.username,
      email: userResult.email,
      rsaPublicKey: userResult.rsaPublicKey,
    });
    
  }, [userResult, addUser]);

}

export default useSocket;
