import React, { useState, useEffect } from 'react';
import useToken from '../../hooks/useToken';
import useFetch from '../../hooks/useFetch';
import useSocket from '../../hooks/useSocket';
import { encryptMessage, decryptMessage } from '../../helpers/cypher/ephimeralCrypto';
import styles from './EphemeralMessages.module.css';

function EphemeralMessages() {
  const token = useToken();
  const socket = useSocket();
  const [username, setUsername] = useState('');
  const [receiver, setReceiver] = useState('');
  const [isEditingReceiver, setIsEditingReceiver] = useState(false);
  const [log, setLog] = useState([]);
  const [key, setKey] = useState(null);
  const [messages, setMessages] = useState([]);

  // Generador simple de ids únicas para usar como key en listas
  const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

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
      setKey(null);
      setMessages([]);
      setLog([]);
      setKey(keyGenerated.join(''));
      addLog(`Clave generada: ${keyGenerated.join('')}`);
    });

    socket.on('receive-photons', ({ senderId, length }) => {
      const basesBob = Array.from({ length }, () => (Math.random() < 0.5 ? '↕' : '↗'));
      setReceiver(senderId);
      socket.emit('measure-photons', { receiverBases: basesBob, senderId });
    });

    socket.on('send-bases-receiver', ({ receiverBases }) => {
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
        { id: genId(), sender, message: decryptedMessage },
      ]);
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
    const entry = { id: genId(), text: message };
    setLog((prevLog) => [...prevLog, entry]);
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
      { id: genId(), sender: username, message },
    ]);
    console.log(`Mensaje cifrado sendMessage: ${encryptedMessage}`);
  };

  return (
    <div className={styles.ephemeralMessagesPage}>
      <h1 className={styles.header}>Mensajes efímeros</h1>
      <div className={styles.inputContainer}>
        {key && !isEditingReceiver ? (
          <>
            {/* Visual label for the receiver display — not a form label to avoid misleading association */}
            <span className={styles.inputLabel}>Chat con:</span>
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
            {/* Properly associate label with the input via htmlFor/id */}
            <label htmlFor="ephemeral-receiver-input" className={styles.inputLabel}>
              Usuario destinatario:
            </label>
            <input
              id="ephemeral-receiver-input"
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
          {log.map((entry) => (
            <div key={entry.id} className={styles.messageItem}>
              {entry.text}
            </div>
          ))}
          {messages.map((msg) => (
            <div
              key={msg.id}
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
            aria-label="Mensaje efímero"
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