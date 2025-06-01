import consts from '../../helpers/consts.js';
import useFetch from '../useFetch.js';
import useToken from '../useToken.js';

function useSendMessage() {
    const { callFetch, result, loading, error } = useFetch();
    const token = useToken();

    const sendMessage = async ({targetUserId, message}) => {
        console.log('Sending message:', { targetUserId, message });
        callFetch({
            uri: `${consts.apiPath}/chat/single/${targetUserId}`,
            method: 'POST',
            body: JSON.stringify({ message, lol:1 }),
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
