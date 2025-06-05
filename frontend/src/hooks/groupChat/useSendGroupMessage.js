import consts from '../../helpers/consts.js';
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
            
        callFetch({
            uri: `${consts.apiPath}/chat/group/${groupId}`,
            method: 'POST',
            body: JSON.stringify({
                message: message,
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
