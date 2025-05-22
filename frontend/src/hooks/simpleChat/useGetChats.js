import consts from '../../helpers/consts.js';
import useFetch from '../useFetch.js';

function useGetChats() {
  const {callFetch, result, loading, error} = useFetch();

    const getChats = async () => {
        const response = await callFetch({
        uri: `${consts.apiPath}/chat`,
        method: 'GET',
        });
    
        return response;
    };

    return {
        getChats,
        result,
        loading,
        error,
    };
}

export default useGetChats;
