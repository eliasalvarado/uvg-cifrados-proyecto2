/**
 * 
 * @param {*} from: The user ID of the sender
 * @param {*} to: The user ID of the receiver
 * @param {*} message: The message content
 * @param {*} datetime: The date and time when the message was sent
 * @param {*} sent: Boolean indicating if the message was sent by the current user
 * @returns 
 */
const getMessageObject = ({from, to, message, datetime, sent, verified }) => ({
    from,
    to,
    message,
    datetime,
    sent,
    verified
})

export default getMessageObject;