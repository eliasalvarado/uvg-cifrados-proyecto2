import registerPrivateMessages from './events/privateMessages.js'
import registerPublicMessages from './events/publicMessages.js'
import registerKeyExchange from './events/keyExchange.js'

const chatData = {}

export default function socketHadler(io, socket) {
  registerPrivateMessages(io, socket)
  registerPublicMessages(io, socket)
  registerKeyExchange(io, socket, chatData)
}
