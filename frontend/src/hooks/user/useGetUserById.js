import consts from '../../helpers/consts.js';
import useFetch from '../useFetch.js';
import useToken from '../useToken.js';

function useGetUserById() {
  const {callFetch, result, loading, error} = useFetch();
  const token = useToken();

    const getUserById = async (userId) => {
        callFetch({
        uri: `${consts.apiPath}/user/${userId}`,
        method: 'GET',
        headers: {
            Authorization: token,
        }});
    };

    return {
        getUserById,
        result,
        loading,
        error,
    };
}

export default useGetUserById;
