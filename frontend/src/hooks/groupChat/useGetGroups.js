import { useEffect, useState } from 'react';
import consts from '../../helpers/consts.js';
import useFetch from '../useFetch.js';
import useToken from '../useToken.js';
import getGroupObject from '../../helpers/dto/getGroupObject.js';
import getGroupMessageObject from '../../helpers/dto/getGroupMessageObject.js';

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

        if(!groupsResult) return;
        const {groups, messages} = groupsResult;

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

        messages.forEach((msg) => {
            const messageObject = getGroupMessageObject({
                userId: msg.userId,
                message: msg.message,
                datetime: msg.datetime,
                sent: msg.sent,
            })

            if (!newMessages[msg.groupId]) {
                newMessages[msg.groupId] = [];
            }

            newMessages[msg.groupId].push(messageObject);
        });

        // Desencriptar el resultado de los grupos

        setResult({groups: newGroups, messages: newMessages});
        
    }, [groupsResult]);

    return {
        getGroups,
        result,
        loading,
        error,
    };
}

export default useGetGroups;
