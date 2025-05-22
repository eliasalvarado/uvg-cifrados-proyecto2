import {
  generateBitsBases,
  encodePhotons,
  measurePhotons,
  compareBasesAndGenerateKey,
} from '../utils/QKD/keyGenerator.js';

const chatData = {};

export function chatHandler(io, socket) {
    socket.on("private_message", async ({ to, encryptedMessage }) => {
        const receptorSocket = [...io.sockets.sockets.values()].find(
        (s) => s.user?.id === to
        );

        if (receptorSocket) {
        receptorSocket.emit("new_message", {
            from: socket.user.id,
            encryptedMessage,
        });
        }
    });

    socket.on("chat_message", async ({ to, encryptedMessage }) => {
        console.log("Mensaje recibido:", encryptedMessage);
    });

    /* socket.on("disconnect", () => {
        console.log(`Usuario desconectado: ${socket.user.name}`);
    }); */

    

    // Registrar al usuario dentro del contexto
    socket.on('join', ({ username }) => {
        socket.username = username;
        console.log(`Usuario "${username}" conectado con ID: ${socket.id}`);
    });

    // Iniciar intercambio de claves entre dos usuarios
    socket.on('start-key-exchange', ({ receiver }) => {
        const receiverSocket = [...io.sockets.sockets.values()].find(
        (s) => s.username === receiver
        );

        if (!receiverSocket) {
        console.error(`El usuario "${receiver}" no está conectado`);
        // socket.emit('error', { message: `El usuario "${receiver}" no está conectado` });
        return;
        }

        console.log(`Iniciando intercambio de claves entre "${socket.username}" y "${receiver}"`);

        // Generación de bits, bases del emisor y enviar los fotones al receptor
        const { bits: senderBits, bases: senderBases } = generateBitsBases();
        const photons = encodePhotons(senderBits, senderBases);

        // Guardar datos en la estructura compartida
        const chatKey = `${socket.username}-${receiver}`;
        chatData[chatKey] = {
        sender: socket.username,
        receiver,
        photons,
        senderBits,
        senderBases,
        };

        // Enviar fotones al receptor
        receiverSocket.emit('receive-photons', { sender: socket.username, photons, length: photons.length });
        console.log('Fotones enviados a', receiver);
    });

    // Medir fotones
    socket.on('measure-photons', ({ receiverBases, sender }) => {
        const chatKey = `${sender}-${socket.username}`;
        const senderData = chatData[chatKey];
        if (!senderData) {
        console.error(`No se encontraron datos para el intercambio entre "${sender}" y "${socket.username}"`);
        // socket.emit('error', { message: `No se encontraron datos para el intercambio` });
        return;
        }

        const { photons } = senderData;

        // Medición de fotones por parte del receptor
        const receiverBits = measurePhotons(photons, receiverBases);

        // Guardar datos del receptor
        senderData.receiverBases = receiverBases;
        senderData.receiverBits = receiverBits;

        // Enviar bases del receiver al sender 
        const senderSocket = [...io.sockets.sockets.values()].find(
        (s) => s.username === sender
        );
        senderSocket.emit('send-bases-receiver', { receiverBases, receiverBits });
        console.log('Bases del receptor enviadas a', sender);
    });

    // Comparar bases y generar clave
    socket.on('compare-bases', ({ receiverBases, receiver }) => {
        const chatKey = `${socket.username}-${receiver}`;
        const senderData = chatData[chatKey];
        if (!senderData) {
        console.error(`No se encontraron datos para el intercambio entre "${socket.username}" y "${receiver}"`);
        return;
        }

        const { senderBases, senderBits, receiverBits } = senderData;

        // Comparación de bases para generar clave
        const key = compareBasesAndGenerateKey(senderBits, senderBases, receiverBases);

        // Enviar clave generada a ambos usuarios
        const receiverSocket = [...io.sockets.sockets.values()].find(
        (s) => s.username === receiver
        );
        socket.emit('key-generated', { key });
        receiverSocket.emit('key-generated', { key });

        // Limpiar datos temporales
        delete chatData[chatKey];
        console.log('Clave generada y enviada a ambos usuarios:', key.join(''));
    });


}
  