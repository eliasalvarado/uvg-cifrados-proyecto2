import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const EphemeralMessages = () => {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [receiver, setReceiver] = useState('');
  const [log, setLog] = useState([]);
  const [key, setKey] = useState(null);

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
    <div>
      <div>
        <label>Tu nombre de usuario:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ingresa tu usuario"
        />
        <button onClick={joinChat}>Unirse</button>
      </div>
      <div>
        <label>Usuario destinatario:</label>
        <input
          type="text"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          placeholder="Usuario con quien establecer clave"
        />
        <button onClick={startKeyExchange}>Iniciar Intercambio de Clave</button>
      </div>
      <div>
        <h3>Log:</h3>
        <ul>
          {log.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      </div>
      {key && <div><strong>Clave generada:</strong> {key}</div>}
    </div>
  );
};

export default EphemeralMessages;