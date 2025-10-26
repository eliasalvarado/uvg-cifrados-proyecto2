import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import SessionContext from "../../context/SessionContext";

function OAuthSuccessPage() {
  const { refreshToken } = useContext(SessionContext);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const token = params.get('token');

    if (token) {
      
        localStorage.setItem("token", token);
        console.log("Token: ", token);
        refreshToken();
    }

    navigate('/');
  }, [navigate]);

  return <p>Procesando autenticación...</p>;
}

export default OAuthSuccessPage;
