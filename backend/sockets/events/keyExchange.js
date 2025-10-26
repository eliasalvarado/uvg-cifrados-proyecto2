import {
  generateBitsBases,
  encodePhotons,
  measurePhotons,
  compareBasesAndGenerateKey,
} from '../../utils/QKD/keyGenerator.js'
import errorSender from '../../utils/errorSender.js';

export default function registerKeyExchange(io, socket, chatData) {
  socket.on('start-key-exchange', ({ receiverId }) => {
    try {
      const receiverSocket = [...io.sockets.sockets.values()].find(
        (s) => s.user.email === receiverId
      );

      if (!receiverSocket) {
        socket.emit('key-exchange-error', { message: `El usuario "${receiverId}" no está conectado.` });
        return;
      }
      const { bits: senderBits, bases: senderBases } = generateBitsBases();
      const photons = encodePhotons(senderBits, senderBases);

      const chatKey = `${socket.user.email}-${receiverId}`;
      chatData[chatKey] = {
        sender: socket.user.email,
        receiver: receiverId,
        photons,
        senderBits,
        senderBases,
      };

      receiverSocket.emit('receive-photons', {
        senderId: socket.user.email,
        photons,
        length: photons.length,
      });
    } catch (error) {
      errorSender({ res: null, ex: error, defaultError: 'Error durante el intercambio de claves.' });
      socket.emit('key-exchange-error', { message: `Error durante el intercambio de claves: ${error.message}` });
    }
  });

  socket.on('measure-photons', ({ receiverBases, senderId }) => {
    try {
      const chatKey = `${senderId}-${socket.user.email}`;
      const senderData = chatData[chatKey];

      if (!senderData) {
        return;
      }

      const { photons } = senderData;
      const receiverBits = measurePhotons(photons, receiverBases);

      senderData.receiverBases = receiverBases;
      senderData.receiverBits = receiverBits;

      const senderSocket = [...io.sockets.sockets.values()].find(
        (s) => s.user.email === senderId
      );

      senderSocket.emit('send-bases-receiver', { receiverBases, receiverBits });
    } catch (error) {
      errorSender({ res: null, ex: error, defaultError: 'Error durante la medición de fotones.' });
      socket.emit('key-exchange-error', { message: `Error durante la medición de fotones: ${error.message}` });
    }
  });

  socket.on('compare-bases', ({ receiverBases, receiverId }) => {
    try {
      const chatKey = `${socket.user.email}-${receiverId}`;
      const senderData = chatData[chatKey];

      if (!senderData) {
        return;
      }

      const { senderBases, senderBits } = senderData;
      const key = compareBasesAndGenerateKey(senderBits, senderBases, receiverBases);

      const receiverSocket = [...io.sockets.sockets.values()].find(
        (s) => s.user.email === receiverId
      );

      socket.emit('key-generated', { keyGenerated: key });
      receiverSocket.emit('key-generated', { keyGenerated: key });

      delete chatData[chatKey];
    } catch (error) {
      errorSender({ res: null, ex: error, defaultError: 'Error durante la comparación de bases.' });
      socket.emit('key-exchange-error', { message: `Error durante la comparación de bases: ${error.message}` });
    }
  });
};