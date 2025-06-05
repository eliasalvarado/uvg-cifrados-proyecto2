import base64ToUint8Array from '../../helpers/base64ToUint8Array.js';
import consts from '../../helpers/consts.js';
import { encryptAES256 } from '../../helpers/cypher/AES-256.js';
import { signMessage } from '../../helpers/cypher/ECDSA.js';
import useChatState from '../useChatState.js';
import useFetch from '../useFetch.js';
import useToken from '../useToken.js';

function useSendGroupMessage() {
    const { groups } = useChatState();
    const { callFetch, result, loading, error } = useFetch();
    const token = useToken();

    const sendGroupMessage = async ({groupId, message}) => {

        if(!message){
            console.error("Mensaje vacío al enviar mensaje");
            return;
        }
        
        // Encriptar el mensaje
        const group = groups?.[groupId];
        if (!group) {
            console.error("Grupo no encontrado al enviar mensaje:", groupId);
            return;
        }

        const keyParsed = base64ToUint8Array(group.key);
        const messageEncrypted = await encryptAES256(message, keyParsed);

        const userPrivateKeyECDSA = localStorage.getItem('privateKeyECDSA');
        const signature = await signMessage(messageEncrypted, userPrivateKeyECDSA);
        
        callFetch({
            uri: `${consts.apiPath}/chat/group/${groupId}`,
            method: 'POST',
            body: JSON.stringify({
                message: messageEncrypted,
                signature: signature
            }),
            headers: {
                'Authorization': token,
            },
        });
    };

    return {
        sendGroupMessage,
        result,
        loading,
        error,
    };
}

export default useSendGroupMessage;
