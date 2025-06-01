import consts from '../../helpers/consts.js';
import { decryptAESRSA, encryptAESRSA } from '../../helpers/cypher/AES_RSA.js';
import useChatState from '../useChatState.js';
import useFetch from '../useFetch.js';
import useToken from '../useToken.js';

function useSendMessage() {
    const { users } = useChatState();
    const { callFetch, result, loading, error } = useFetch();
    const token = useToken();

    const sendMessage = async ({targetUserId, message}) => {

        if(!message){
            console.error("Mensaje vacío al enviar mensaje");
            return;
        }
        
        // Encriptar el mensaje
        const targetUser = users[targetUserId];
        if (!targetUser) {
            console.error("Usuario no encontrado al enviar mensaje:", targetUserId);
            return;
        }

        const { textEncrypted,  keyEncrypted } = await encryptAESRSA(message, targetUser.rsaPublicKey);
            
        callFetch({
            uri: `${consts.apiPath}/chat/single/${targetUserId}`,
            method: 'POST',
            body: JSON.stringify({ message: textEncrypted, key: keyEncrypted }),
            headers: {
                'Authorization': token,
            },
        });
    };

    return {
        sendMessage,
        result,
        loading,
        error,
    };
}

export default useSendMessage;
