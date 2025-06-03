import { useEffect } from 'react';
import { decryptAESRSA } from '../../helpers/cypher/AES_RSA.js';
import getMessageObject from '../../helpers/dto/getMessageObject.js';
import getTokenPayload from '../../helpers/getTokenPayload.js';
import useChatState from '../useChatState.js';
import useGetUserById from '../user/useGetUserById.js';
import useToken from '../useToken.js';

function useAddReceivedMessage() {

    const token = useToken();
    const { addSingleChatMessage, users, addUser } = useChatState();
    const { getUserById, result: userResult } = useGetUserById();

    useEffect(() => {
        if (!userResult) return;

        if (users[userResult.id]) return;

        addUser({
            userId: userResult.id,
            username: userResult.username,
            email: userResult.email,
            rsaPublicKey: userResult.rsaPublicKey,
        });

    }, [userResult, addUser]);

    const addReceivedMessage = async (data) => {


        if (!token) {
            console.error('No token found');
            return;
        }
        const userData = getTokenPayload(token);
        if (!userData) {
            console.error('Invalid token');
            return;
        }


        if (data.to === userData.id) {

            // Descifrar mensaje
            const privateKeyRSA = localStorage.getItem('privateKeyRSA');
            if (!privateKeyRSA) {
                console.error('Private key not found in localStorage');
                return;
            }

            const { message: messageEncrypted, targetKey } = data;

            const message = await decryptAESRSA(messageEncrypted, targetKey, privateKeyRSA);
            const messageObject = getMessageObject({
                from: data.from,
                to: data.to,
                message,
                datetime: new Date(data.datetime),
                sent: false, // Indica que el mensaje fue recibido
            })

            addSingleChatMessage(messageObject);

            // Si el usuario no existe, agregarlo
            if (data.from && !users[data.from]) {
                getUserById(data.from)
            }
        }
    };

    return addReceivedMessage;
}

export default useAddReceivedMessage;
