import consts from '../../helpers/consts.js';
import useFetch from '../useFetch.js';
import useToken from '../useToken.js';

function useJoinGroup() {
    const { callFetch, result, loading, error } = useFetch();
    const token = useToken();

    const joinGroup = async ({groupName}) => {

        callFetch({
            uri: `${consts.apiPath}/chat/group/join`,
            method: 'POST',
            body: JSON.stringify({
                groupName
            }),
            headers: {
                'Authorization': token,
            },
        });
    };

    return {
        joinGroup,
        result,
        loading,
        error,
    };
}

export default useJoinGroup;
