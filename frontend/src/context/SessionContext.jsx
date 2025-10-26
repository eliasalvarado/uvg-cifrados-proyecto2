import React, {
  createContext, useEffect, useState, useCallback, useMemo,
} from 'react';
import PropTypes from 'prop-types';

const SessionContext = createContext();
function SessionProvider({ children }) {
  const [token, setToken] = useState(null);

  const refreshToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
    }
  }, []);

  const clearToken = useCallback(() => {
    setToken(null);
  }, []);

  const data = useMemo(() => ({
    token,
    refreshToken,
    clearToken,
  }), [token, refreshToken, clearToken]);

  useEffect(() => {
    refreshToken();
  }, []);

  return <SessionContext.Provider value={data}>{children}</SessionContext.Provider>;
}

export { SessionProvider };
export default SessionContext;

SessionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
