import { useEffect, useState } from 'react';
import consts from '../../helpers/consts.js';
import useFetch from '../useFetch.js';
import useToken from '../useToken.js';
import getGroupObject from '../../helpers/dto/getGroupObject.js';
import getGroupMessageObject from '../../helpers/dto/getGroupMessageObject.js';
import { decryptAES256 } from '../../helpers/cypher/AES-256.js';
import base64ToUint8Array from '../../helpers/base64ToUint8Array.js';

function useGetGroups() {
    const { callFetch, result: groupsResult, loading, error } = useFetch();
    const token = useToken();
    const [result, setResult] = useState(null);

    const getGroups = async () => {

        callFetch({
            uri: `${consts.apiPath}/chat/group`,
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        });
    };

    useEffect(() => {

        (async () => {
            if (!groupsResult) return;
            const { groups, messages } = groupsResult;

            const newGroups = {};
            groups.forEach((group) => {
                const groupObject = getGroupObject({
                    groupId: group.groupId,
                    name: group.name,
                    creatorId: group.creator_id,
                    key: group.key,
                });
                newGroups[group.groupId] = groupObject;
            });

            const newMessages = {};

            await Promise.allSettled(
                messages.map(async (msg) => {

                    const key = newGroups[msg.groupId]?.key;
                    if (key) {

                        const keyParsed = base64ToUint8Array(key);

                        // Desencriptar el mensaje
                        const messageDecrypted = await decryptAES256(msg.message, keyParsed);

                        const messageObject = getGroupMessageObject({
                            userId: msg.userId,
                            message: messageDecrypted,
                            datetime: msg.datetime,
                            sent: msg.sent,
                        })

                        if (!newMessages[msg.groupId]) {
                            newMessages[msg.groupId] = [];
                        }

                        newMessages[msg.groupId].push(messageObject);
                    }
                })
            )

            // Desencriptar el resultado de los grupos

            setResult({ groups: newGroups, messages: newMessages });
        })();

    }, [groupsResult]);

    return {
        getGroups,
        result,
        loading,
        error,
    };
}

export default useGetGroups;
