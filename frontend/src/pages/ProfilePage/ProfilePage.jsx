import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';
import SessionContext from "../../context/SessionContext";
import Button from '../../components/Button';
import PopUp from '../../components/Popup';
import Spinner from '../../components/Spinner';
import useToken from '../../hooks/useToken';
import useFetch from '../../hooks/useFetch';
import usePopUp from '../../hooks/usePopup';

function ProfilePage() {

    const [isMFAOpen, openMFA, closeMFA] = usePopUp();
    const { refreshToken } = useContext(SessionContext);
    const token = useToken();
    const navigate = useNavigate();

    const {
        callFetch: getUserInfo,
        result: resultUserInfo,
        loading: loadingUserInfo,
        error: errorUserInfo,
        reset: resetUserInfo
    } = useFetch();

    const {
        callFetch: fetchSetupMFA,
        result: resultSetupMFA,
        loading: loadingSetupMFA,
        error: errorSetupMFA
    } = useFetch();

    const handleGetUserInfo = () => {
        resetUserInfo();
        getUserInfo({
            uri: "/api/user/profile",
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'Authorization': token,
            },
        });
    }

    const logout = () => {
        localStorage.removeItem('token');
        refreshToken();
        
        navigate("/");
    }

    useEffect(() => {
        if (!token) return;
        handleGetUserInfo();
    }, [token]);

    const handleSetupMFA = (e) => {
        e.preventDefault();
        openMFA();

        if (resultUserInfo?.mfa_enabled) return; // Si MFA ya está habilitado, no se hace nada

        fetchSetupMFA({
            uri: "/api/user/mfa/setup",
            method: "POST",
            body: JSON.stringify({}),
            headers: {
                "Content-Type": "application/json",
                'Authorization': token,
            },
        });
    }

    useEffect(() => {
        if (!resultUserInfo) return;
        console.log(resultUserInfo);
    }, [resultUserInfo]);

    return (
    <div className={styles.pageContainer}>
        <div className={styles.header}>
            <h1>Perfil de Usuario</h1>
        </div> 
        <div className={styles.buttonsContainer}>
            <Button text="Activar MFA" green onClick={handleSetupMFA} />
            <Button text="Cerrar sesión" red onClick={logout} />
        </div>
        {isMFAOpen && (
            <PopUp close={closeMFA} closeButton closeWithBackground callback={handleGetUserInfo}>
                {resultUserInfo?.mfa_enabled ? (
                    <div className={styles.mfaContainer}>
                        <h2>MFA ya está habilitado</h2>
                        <p>El MFA ya está habilitado para tu cuenta.</p>
                    </div>
                ) : (
                    <div className={styles.mfaContainer}>
                        <h2>Configurar MFA</h2>
                        {loadingSetupMFA ? (
                            <Spinner />
                        ) : (
                            <>
                                {resultSetupMFA?.qrCode && (
                                    <>
                                    <img src={resultSetupMFA.qrCode} alt="QR Code" />
                                    <p className={styles.mfaMessage}>Escanea el código QR con tu aplicación de autenticación. No cierres este mensaje hasta haberlo hecho.</p>
                                    </>
                                )}
                                {errorSetupMFA && <p>{errorSetupMFA.message}</p>}
                            </>
                        )}
                    </div>
                )}
            </PopUp>
        )}
    </div>
    );
}

export default ProfilePage;
