import React, { useEffect, useContext } from 'react';
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
    const [isDeleteMFAOpen, openDeleteMFA, closeDeleteMFA] = usePopUp();
    const { clearToken } = useContext(SessionContext);
    const token = useToken();
    const navigate = useNavigate();

    const {
        callFetch: getUserInfo,
        result: resultUserInfo,
        reset: resetUserInfo
    } = useFetch();

    const {
        callFetch: fetchSetupMFA,
        result: resultSetupMFA,
        loading: loadingSetupMFA,
        error: errorSetupMFA,
        reset: resetSetupMFA
    } = useFetch();

    const {
        callFetch: fetchDeleteMFA,
        result: resultDeleteMFA,
        loading: loadingDeleteMFA,
        error: errorDeleteMFA,
        reset: resetDeleteMFA
    } = useFetch();

    const handleGetUserInfo = () => {
        resetUserInfo();
        resetDeleteMFA();
        resetSetupMFA();
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
		console.log("Logout");
        localStorage.removeItem('token');
        clearToken();
        
        navigate("/", { replace: true });
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

    const handleDeleteMFA = (e) => {
        e.preventDefault();
        if (!resultUserInfo?.mfa_enabled) return; // Si MFA no está habilitado, no se hace nada
        fetchDeleteMFA({
            uri: "/api/user/mfa/delete",
            method: "DELETE",
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
            {resultUserInfo?.mfa_enabled ? (
                <Button text="Desactivar MFA" gray onClick={openDeleteMFA} />
            ) : (
                <Button text="Activar MFA" emptyBlue onClick={handleSetupMFA} />
            )}
            <Button text="Cerrar sesión" black onClick={logout} />
        </div>
        {isMFAOpen && (
            <PopUp close={closeMFA} closeButton closeWithBackground maxWidth={500} callback={handleGetUserInfo}>
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
        {isDeleteMFAOpen && (
            <PopUp close={closeDeleteMFA} closeButton closeWithBackground maxWidth={500} callback={handleGetUserInfo}>
                <div className={styles.deleteMFAContainer}>
                    <h2>Desactivar MFA</h2>
                    {loadingDeleteMFA ? (
                        <Spinner />
                    ) : (
                        <>
                            {!resultDeleteMFA && (
                                <>
                                    <p>¿Estás seguro de que quieres desactivar el MFA? Esta acción no se puede deshacer.</p>
                                    <Button text="Desactivar MFA" black onClick={handleDeleteMFA} />
                                </>
                            )}
                            {errorDeleteMFA && <p>{errorDeleteMFA.message}</p>}
                            {resultDeleteMFA && <p>MFA desactivado exitosamente.</p>}
                        </>
                    )}
                </div>
            </PopUp>
        )}
    </div>
    );
}

export default ProfilePage;
