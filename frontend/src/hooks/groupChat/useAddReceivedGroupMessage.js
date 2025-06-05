import { useRef, useEffect } from 'react';
import useChatState from '../useChatState.js';
import getGroupMessageObject from '../../helpers/dto/getGroupMessageObject.js';
import { decryptAES256 } from '../../helpers/cypher/AES-256.js';
import base64ToUint8Array from '../../helpers/base64ToUint8Array.js';

function useAddReceivedGroupMessage() {
    const { addGroupChatMessage, groups } = useChatState();

    // ref que siempre mantiene el último valor de `groups`
    const groupsRef = useRef(groups);

    // Actualizar ref cada vez que `groups` cambie
    useEffect(() => {
        groupsRef.current = groups;
    }, [groups]);

    const addReceivedGroupMessage = async (data) => {
        const { message: messageEncrypted, groupId, datetime, userId, username } = data;

        const group = groupsRef.current?.[groupId];
        if (!group) {
            console.error("Grupo no encontrado al recibir mensaje realtime:", groupId);
            return;
        }

        const keyParsed = base64ToUint8Array(group.key);
        const message = await decryptAES256(messageEncrypted, keyParsed);

        const messageObject = getGroupMessageObject({
            userId,
            groupId,
            message,
            datetime: new Date(datetime),
            sent: false,
            username,

        });

        addGroupChatMessage(groupId, messageObject);
    };

    return addReceivedGroupMessage;
}

export default useAddReceivedGroupMessage;
