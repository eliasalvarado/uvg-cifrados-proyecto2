import consts from '../../helpers/consts.js';
import useFetch from '../useFetch.js';
import useToken from '../useToken.js';

function useCreateGroup() {
    const { callFetch, result, loading, error } = useFetch();
    const token = useToken();

    const createGroup = async ({name}) => {

        callFetch({
            uri: `${consts.apiPath}/chat/group`,
            method: 'POST',
            body: JSON.stringify({
                name
            }),
            headers: {
                'Authorization': token,
            },
        });
    };

    return {
        createGroup,
        result,
        loading,
        error,
    };
}

export default useCreateGroup;
