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
}
  