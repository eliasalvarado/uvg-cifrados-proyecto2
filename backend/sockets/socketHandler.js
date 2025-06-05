import registerPrivateMessages from './events/privateMessages.js'
import registerPublicMessages from './events/publicMessages.js'
import registerKeyExchange from './events/keyExchange.js'
import joinGroupRoom from './events/joinGroupRoom.js'
import registerEphemeralMessageHandler from './events/ephemeralMessage.js'

const chatData = {}

export default function socketHadler(io, socket) {
  registerPrivateMessages(io, socket)
  registerPublicMessages(io, socket)
  registerKeyExchange(io, socket, chatData)
  joinGroupRoom(io, socket)
  registerEphemeralMessageHandler(io, socket, chatData)
}
