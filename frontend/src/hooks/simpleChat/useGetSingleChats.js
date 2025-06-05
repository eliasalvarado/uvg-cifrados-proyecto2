import { useState } from 'react';
import consts from '../../helpers/consts.js';
import useFetch from '../useFetch.js';
import useToken from '../useToken.js';
import { useEffect } from 'react';
import getMessageObject from '../../helpers/dto/getMessageObject.js';
import getUserObject from '../../helpers/dto/getUserObject.js';
import { decryptAESRSA } from '../../helpers/cypher/AES_RSA.js';

function useGetSingleChats() {
    const {callFetch, result: fetchResult, loading, error} = useFetch();
    const token = useToken();
    const [result, setResult] = useState(null);

    const getSingleChats = () => {
        callFetch({
            uri: `${consts.apiPath}/chat/single`,
            method: 'GET',
            headers: {
                'Authorization': token,
            }
        });
    };

    useEffect(() => {

        if (!fetchResult) return;
        const { messages, contacts } = fetchResult;
        const privateKeyRSA = localStorage.getItem('privateKeyRSA');

        // Reemplazar los mensajes simples con los obtenidos del servidor
        const newMessages = {};
        messages.forEach((msg) => {
            // Desencriptar el mensaje
            const key = msg.sent === 1 ? msg.origin_key : msg.target_key;

            const msgObject = getMessageObject({
                from: msg.origin_user_id,
                to: msg.target_user_id,
                message: decryptAESRSA(msg.message, key, privateKeyRSA),
                datetime: msg.created_at,
                sent: msg.sent === 1
            });
            const userId = msgObject.sent ? msgObject.to : msgObject.from;
            if (!newMessages[userId]) {
                newMessages[userId] = [];
            }
            newMessages[userId].push(msgObject);
        });

        // Reemplazar los usuarios con los obtenidos del servidor

        const newContacts = {};
        contacts.forEach((contact) => {
            if (!newContacts[contact.id]) {
                newContacts[contact.id] = getUserObject({
                    userId: contact.id,
                    username: contact.username,
                    email: contact.email,
                    rsaPublicKey: contact.rsa_public_key
                });
            }
        });

        setResult({
            messages: newMessages,
            contacts: newContacts
        });

    }, [fetchResult]);

    return {
        getSingleChats,
        result,
        loading,
        error,
    };
}

export default useGetSingleChats;
