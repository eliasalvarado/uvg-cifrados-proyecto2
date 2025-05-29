// events/keyExchange.js
import {
  generateBitsBases,
  encodePhotons,
  measurePhotons,
  compareBasesAndGenerateKey,
} from '../../utils/QKD/keyGenerator.js'

export default function registerKeyExchange(io, socket, chatData) {
  socket.on('start-key-exchange', ({ receiver }) => {
    const receiverSocket = [...io.sockets.sockets.values()].find(
      (s) => s.username === receiver
    )

    if (!receiverSocket) {
      console.error(`El usuario "${receiver}" no está conectado`)
      return
    }

    console.log(`Iniciando intercambio de claves entre "${socket.username}" y "${receiver}"`)
    const { bits: senderBits, bases: senderBases } = generateBitsBases()
    const photons = encodePhotons(senderBits, senderBases)

    const chatKey = `${socket.username}-${receiver}`
    chatData[chatKey] = {
      sender: socket.username,
      receiver,
      photons,
      senderBits,
      senderBases,
    }

    receiverSocket.emit('receive-photons', {
      sender: socket.username,
      photons,
      length: photons.length,
    })
  })

  socket.on('measure-photons', ({ receiverBases, sender }) => {
    const chatKey = `${sender}-${socket.username}`
    const senderData = chatData[chatKey]

    if (!senderData) {
      console.error(`No se encontraron datos para el intercambio entre "${sender}" y "${socket.username}"`)
      return
    }

    const { photons } = senderData
    const receiverBits = measurePhotons(photons, receiverBases)

    senderData.receiverBases = receiverBases
    senderData.receiverBits = receiverBits

    const senderSocket = [...io.sockets.sockets.values()].find(
      (s) => s.username === sender
    )

    senderSocket.emit('send-bases-receiver', { receiverBases, receiverBits })
  })

  socket.on('compare-bases', ({ receiverBases, receiver }) => {
    const chatKey = `${socket.username}-${receiver}`
    const senderData = chatData[chatKey]

    if (!senderData) {
      console.error(`No se encontraron datos para el intercambio entre "${socket.username}" y "${receiver}"`)
      return
    }

    const { senderBases, senderBits } = senderData
    const key = compareBasesAndGenerateKey(senderBits, senderBases, receiverBases)

    const receiverSocket = [...io.sockets.sockets.values()].find(
      (s) => s.username === receiver
    )

    socket.emit('key-generated', { key })
    receiverSocket.emit('key-generated', { key })

    delete chatData[chatKey]
    console.log('Clave generada y enviada a ambos usuarios:', key.join(''))
  })
}
