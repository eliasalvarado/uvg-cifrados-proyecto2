import consts from '../../helpers/consts.js';
import useFetch from '../useFetch.js';
import useToken from '../useToken.js';

function useSearchUser() {
  const {callFetch, result, loading, error} = useFetch();
  const token = useToken();

    const searchUser = async (searchTerm) => {
        const response = await callFetch({
        uri: `${consts.apiPath}/user/search/${searchTerm}`,
        method: 'GET',
        headers: {
            Authorization: token,
        }});
    
        return response;
    };

    return {
        searchUser,
        result,
        loading,
        error,
    };
}

export default useSearchUser;
