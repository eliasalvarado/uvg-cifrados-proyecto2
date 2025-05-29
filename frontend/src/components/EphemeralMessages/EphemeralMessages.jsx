import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import useToken from '../../hooks/useToken';
import useFetch from '../../hooks/useFetch';

import styles from './EphemeralMessages.module.css';

const EphemeralMessages = () => {
  const token = useToken();
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [receiver, setReceiver] = useState('');
  const [log, setLog] = useState([]);
  const [key, setKey] = useState(null);

  const {
    callFetch: getUserInfo,
    result: resultUserInfo,
    reset: resetUserInfo
  } = useFetch();

  const handleGetUserInfo = () => {
      resetUserInfo();
      getUserInfo({
          uri: "/api/user/profile",
          method: "GET",
          headers: {
              "Content-Type": "application/json",
              'Authorization': token,
          },
      });
  }

  useEffect(() => {
      if (!token) return;
      
      handleGetUserInfo();
  }, [token]);

  useEffect(() => {
      if (!resultUserInfo) return;

      setUsername(resultUserInfo?.email);
  }, [resultUserInfo]);

  useEffect(() => {
      if (!username) return;

      joinChat();
  }, [username]);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('key-generated', ({ key }) => {
      setKey(key.join(''));
      addLog(`Clave generada: ${key.join('')}`);
    });

    newSocket.on('receive-photons', ({ sender, photons, length }) => {
      addLog(`Fotones recibidos de ${sender}: ${photons.join(' ')}`);
      const basesBob = Array.from({ length }, () => (Math.random() < 0.5 ? '↕' : '↗'));
      addLog(`Bases generadas: ${basesBob.join(' ')}`);
      newSocket.emit('measure-photons', { receiverBases: basesBob, sender });
    });

    newSocket.on('send-bases-receiver', ({ receiverBases, receiverBits }) => {
      addLog(`Bases del receptor recibidas: ${receiverBases.join(' ')}`);
      addLog(`Bits medidos por el receptor: ${receiverBits.join(' ')}`);
      console.log('receiver', receiver);
      newSocket.emit('compare-bases', { receiverBases, receiver });
    });

    return () => newSocket.close();
  }, [receiver]);

  const addLog = (message) => {
    setLog((prevLog) => [...prevLog, message]);
  };

  const joinChat = () => {
    if (!username) {
      addLog('Por favor, ingresa tu nombre de usuario.');
      return;
    }
    socket.emit('join', { username });
    addLog(`Usuario "${username}" conectado.`);
  };

  const startKeyExchange = () => {
    if (!receiver) {
      addLog('Por favor, ingresa el nombre del destinatario.');
      return;
    }
    socket.emit('start-key-exchange', { receiver });
    addLog(`Iniciando intercambio de claves con "${receiver}"...`);
  };

  return (
    <div className={styles.ephemeralMessagesPage}>
      <h1 className={styles.header}>Mensajes efímeros</h1>
      <div className={styles.inputContainer}>
        <label className={styles.inputLabel}>Usuario destinatario:</label>
        <input
          type="text"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          placeholder="Usuario con quien establecer clave"
          className={styles.inputField}
        />
        <button onClick={startKeyExchange} className={styles.startButton}>
          Iniciar intercambio de claves
        </button>
        {key && <div className={styles.keyEstablished}>Llave establecida - {key}</div>}
      </div>
      <div className={styles.chatContainer}>
        <div className={styles.messagesList}>
          {log.map((message, index) => (
            <div key={index} className={styles.messageItem}>
              {message}
            </div>
          ))}
        </div>
        <div className={styles.inputMessageContainer}>
          <input
            type="text"
            placeholder="Escribe tu mensaje..."
            className={styles.inputMessageField}
          />
          <button className={styles.sendButton}>Enviar</button>
        </div>
      </div>
    </div>
  );
};

export default EphemeralMessages;