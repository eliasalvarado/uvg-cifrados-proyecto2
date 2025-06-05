import useChatState from '../useChatState.js';
import getGroupMessageObject from '../../helpers/dto/getGroupMessageObject.js';

function useAddReceivedGroupMessage() {

    const { addGroupChatMessage } = useChatState();

    const addReceivedGroupMessage = async (data) => {


        const { message: messageEncrypted, groupId, datetime, userId } = data;

        const message = messageEncrypted;
        const messageObject = getGroupMessageObject({
            userId,
            groupId,
            message,
            datetime: new Date(datetime),
            sent: false, // Indica que el mensaje fue recibido
        })

        addGroupChatMessage(groupId, messageObject);

    };

    return addReceivedGroupMessage;
}

export default useAddReceivedGroupMessage;
