import React, { useState, useEffect } from 'react';
import useToken from '../../hooks/useToken';
import useFetch from '../../hooks/useFetch';
import useSocket from '../../hooks/useSocket';
import { encryptMessage, decryptMessage } from '../../helpers/cypher/ephimeralCrypto';
import styles from './EphemeralMessages.module.css';

const EphemeralMessages = () => {
  const token = useToken();
  const socket = useSocket();
  const [username, setUsername] = useState('');
  const [receiver, setReceiver] = useState('');
  const [isEditingReceiver, setIsEditingReceiver] = useState(false);
  const [log, setLog] = useState([]);
  const [key, setKey] = useState(null);
  const [messages, setMessages] = useState([]);

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
    if (!socket) return;

    socket.on('key-exchange-error', ({ message }) => {
      addLog(`Error en el intercambio de claves: ${message}`);
    });

    socket.on('key-generated', ({ keyGenerated }) => {
      if (key && key !== keyGenerated.join('')) {
        setKey(null);
        setMessages([]);
        setLog([]);
      }
      setKey(keyGenerated.join(''));
      addLog(`Clave generada: ${keyGenerated.join('')}`);
    });

    socket.on('receive-photons', ({ senderId, photons, length }) => {
      const basesBob = Array.from({ length }, () => (Math.random() < 0.5 ? '↕' : '↗'));
      setReceiver(senderId);
      socket.emit('measure-photons', { receiverBases: basesBob, senderId });
    });

    socket.on('send-bases-receiver', ({ receiverBases, receiverBits }) => {
      socket.emit('compare-bases', { receiverBases, receiverId: receiver });
    });

    socket.on('receive-ephemeral-message', ({ sender, encryptedMessage }) => {
      console.log(`Mensaje recibido de ${sender}: ${encryptedMessage}`);
      if (!key) {
        addLog('No se puede descifrar el mensaje porque no se posee la clave.');
        return;
      }
      const decryptedMessage = decryptMessage(encryptedMessage, key);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender, message: decryptedMessage },
      ]);
      //console.log(`Mensaje descifrado: ${decryptedMessage}`);
    });

    return () => {
      socket.off('key-generated');
      socket.off('key-exchange-error');
      socket.off('receive-photons');
      socket.off('send-bases-receiver');
      socket.off('receive-ephemeral-message');
    };
  }, [socket, key, receiver]);

  const addLog = (message) => {
    setLog((prevLog) => [...prevLog, message]);
  };

  const startKeyExchange = () => {
    if (!receiver) {
      addLog('Por favor, ingresa el nombre del destinatario.');
      return;
    }
    socket.emit('start-key-exchange', { receiverId: receiver });
    setKey(null);
    setMessages([]);
    setLog([]);
    setIsEditingReceiver(false);
  };

  const sendMessage = (message) => {
    if (!key) {
      addLog('No se puede enviar el mensaje porque no se posee la clave.');
      return;
    }
    const encryptedMessage = encryptMessage(message, key);
    socket.emit('send-ephemeral-message', { receiver, encryptedMessage });
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: username, message },
    ]);
    console.log(`Mensaje cifrado sendMessage: ${encryptedMessage}`);
  };

  return (
    <div className={styles.ephemeralMessagesPage}>
      <h1 className={styles.header}>Mensajes efímeros</h1>
      <div className={styles.inputContainer}>
        {key && !isEditingReceiver ? (
          <>
            <label className={styles.inputLabel}>Chat con:</label>
            <div className={styles.receiverDisplay}>{receiver}</div>
            <button
              onClick={() => setIsEditingReceiver(true)}
              className={styles.editReceiverButton}
            >
              Cambiar destinatario
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
        {key && <div className={styles.keyEstablished}>Llave establecida - {key}</div>}
      </div>
      <div className={styles.chatContainer}>
        <div className={styles.messagesList}>
          {log.map((message, index) => (
            <div key={index} className={styles.messageItem}>
              {message}
            </div>
          ))}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.messageItem} ${
                msg.sender === username ? styles.sentMessage : styles.receivedMessage
              }`}
            >
              <strong>{msg.sender === username ? 'Yo' : msg.sender}:</strong> {msg.message}
            </div>
          ))}
        </div>
        <div className={styles.inputMessageContainer}>
          <input
            type="text"
            placeholder="Escribe tu mensaje..."
            className={styles.inputMessageField}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage(e.target.value);
                e.target.value = '';
              }
            }}
          />
          <button
            className={styles.sendButton}
            onClick={() => {
              const input = document.querySelector(`.${styles.inputMessageField}`);
              sendMessage(input.value);
              input.value = '';
            }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EphemeralMessages;