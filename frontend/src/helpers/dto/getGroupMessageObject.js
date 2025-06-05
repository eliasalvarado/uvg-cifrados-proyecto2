/**
 * 

 * @param {*} message: The message content
 * @param {*} userId: The user ID of the sender
 * @param {*} datetime: The date and time when the message was sent
 * @param {*} sent: Boolean indicating if the message was sent by the current user
 * @returns 
 */
const getGroupMessageObject = ({message, userId, datetime, sent }) => ({
    message,
    userId,
    sent,
    datetime,
})

export default getGroupMessageObject;