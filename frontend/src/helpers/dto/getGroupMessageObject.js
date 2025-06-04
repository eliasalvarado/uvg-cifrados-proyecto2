/**
 * 

 * @param {*} message: The message content
 * @param {*} userId: The user ID of the sender
 * @param {*} datetime: The date and time when the message was sent
 * @param {*} sent: Boolean indicating if the message was sent by the current user
 * @param {*} key: The key associated with the message
 * @returns 
 */
const getGroupMessageObject = ({message, userId, datetime, sent, key }) => ({
    message,
    userId,
    sent,
    datetime,
    key    
})

export default getGroupMessageObject;