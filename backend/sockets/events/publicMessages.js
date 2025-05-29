export default function registerPublicMessages(io, socket) {
  socket.on("chat_message", ({ to, encryptedMessage }) => {
    console.log("Mensaje recibido:", encryptedMessage)
  })

  socket.on("join", ({ username }) => {
    socket.username = username
    console.log(`Usuario "${username}" conectado con ID: ${socket.id}`)
  })
}
