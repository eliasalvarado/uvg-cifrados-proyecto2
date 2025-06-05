import { useContext } from 'react';
import SessionContext from '../context/SessionContext';

function useLogout() {
    const { clearToken } = useContext(SessionContext);
    
    function logout(){
        clearToken();
        localStorage.removeItem('token');
        localStorage.removeItem('privateKeyECDSA');
		localStorage.removeItem('privateKeyRSA');
		localStorage.removeItem('publicKeyRSA');
		localStorage.removeItem('publicKeyECDSA');
    }
    return logout;
}

export default useLogout;
