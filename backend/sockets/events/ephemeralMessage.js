export default function registerEphemeralMessageHandler(io, socket) {
  socket.on('send-ephemeral-message', ({ receiver, encryptedMessage }) => {

    const receiverSocket = [...io.sockets.sockets.values()].find(
      (s) => s.user.email === receiver
    );

    if (!receiverSocket) {
      console.error(`El usuario "${receiver}" no está conectado.`);
      return;
    }

    receiverSocket.emit('receive-ephemeral-message', {
      sender: socket.user.email,
      encryptedMessage,
    });
  });
}