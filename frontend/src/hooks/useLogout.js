import { useContext } from 'react';
import SessionContext from '../context/SessionContext';

function useLogout() {
    const { clearToken } = useContext(SessionContext);
    
    function logout(){
        clearToken();
        localStorage.removeItem('token');
    }
    return logout;
}

export default useLogout;
