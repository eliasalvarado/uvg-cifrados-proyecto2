import { isHealthy } from '../../utils/blockchainHealth.js';

export default function registerPrivateMessages(io, socket) {
  socket.on("private_message", ({ to, encryptedMessage }) => {
    if (!isHealthy()) {
      return ack?.({ ok: false, error: 'read_only' });
    }
    const receptorSocket = [...io.sockets.sockets.values()].find(
      (s) => s.user?.id === to
    )

    if (receptorSocket) {
      receptorSocket.emit("new_message", {
        from: socket.user.id,
        encryptedMessage,
      })
    }
  })
}
