import React, { useContext, useState, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import styles from "./LoginPage.module.css";
import SessionContext from "../../context/SessionContext";
import InputText from "../../components/InputText";
import Button from "../../components/Button";
import GoogleLoginButton from "../../components/GoogleLoginButton";
import PopUp from "../../components/Popup";
import usePopUp from "../../hooks/usePopup";
import Spinner from "../../components/Spinner";
import { Link } from "react-router-dom";

function LoginPage() {

    const [form, setForm] = useState({});
    const [errors, setErrors] = useState(null);
    const { refreshToken } = useContext(SessionContext);
    const [isMFAOpen, openMFA, closeMFA] = usePopUp();

    const {
        callFetch: fetchLogin,
        result: resultLogin,
        loading:loadingLogin,
        error: errorLogin
    } = useFetch();

    const {
        callFetch: fetchMFA,
        result: resultMFA,
        loading:loadingMFA,
        error: errorMFA
    } = useFetch();

    const handleLogin = (e) => {

        e.preventDefault();
        console.log("Login");
        const { username, password } = form;
        if (!validateUsername()) return;
        if (!validatePassword()) return;

        fetchLogin({
            uri: "/api/user/login",
            method: "POST",
            body: JSON.stringify({ email: username, password }),
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    const handleMFA = (e) => {
        e.preventDefault();
        const { mfa_code } = form;
        if (!validateMFA()) return;

        fetchMFA({
            uri: `/api/user/mfa/verify/${resultLogin.user_id}`,
            method: "POST",
            body: JSON.stringify({ token: mfa_code }),
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    const handleFormChange = (e) => {
        const field = e.target.name;
        const { value } = e.target;
        setForm((lastValue) => ({ ...lastValue, [field]: value }));
    };

    const validateUsername = () => {
        if (form?.password?.trim().length > 0) return true;
        setErrors((lastValue) => ({ ...lastValue, username: "El usuario es requerido" }));
    }

    const validatePassword = () => {
        if (form?.password?.trim().length > 0) return true;
        setErrors((lastValue) => ({ ...lastValue, password: "La contraseña es requerida" }));
    }

    const validateMFA = () => {
        if (form?.mfa_code?.trim().length > 0) return true;
        setErrors((lastValue) => ({ ...lastValue, mfa_code: "El código MFA es requerido" }));
        return false;
    }

    const clearError = (e) => {
        const field = e.target.name;
        setErrors((lastValue) => ({ ...lastValue, [field]: null }));
    }

    useEffect(() => {
        if (!resultLogin) return;

        // Verificar si el usuario tiene autenticación de dos factores habilitada
        if (resultLogin.mfa_enabled) {
            // Si MFA está habilitado, abrir el popup
            openMFA();
            return;
        }

        if (!resultLogin?.token) return;

        localStorage.setItem("token", resultLogin.token);
        refreshToken();

    }, [resultLogin]);

    useEffect(() => {
        if (!resultMFA?.token) return;

        // Guardar el token en el localStorage
        localStorage.setItem("token", resultMFA.token);
        refreshToken();
    }, [resultMFA]);

    return (
        <div className={styles.loginPageContainer}>
          <h1 className={styles.title}>Iniciar sesión</h1>
          <form className={styles.loginForm} onSubmit={handleLogin}>
            <InputText 
                title="Usuario"
                name="username"
                onChange={handleFormChange}
                value={form?.username}
                error={errors?.username}
                onBlur={validateUsername}
                onFocus={clearError}
            />
            <InputText 
                title="Contraseña"
                name="password"
                onChange={handleFormChange}
                value={form?.password}
                error={errors?.password}
                onBlur={validatePassword}
                onFocus={clearError}
                hidden
            />
            <div className={styles.buttonContainer}>
                {!loadingLogin && (
                    <Button
                        text="Iniciar sesión"
                        onClick={handleLogin}
                        loading={loadingLogin}
                    />
                )}
                {loadingLogin && <Spinner />}
            </div>
            <div className={styles.googleLoginContainer}>
                <GoogleLoginButton />
            </div>
            {errorLogin && <p className={styles.errorMessage}>{errorLogin.message}</p>}
          </form>
          <p className={styles.registerLink}>
            ¿No tienes cuenta? <Link to="/register" className={styles.registerHere}>Regístrate aquí</Link>
          </p>
            {isMFAOpen && (
                <PopUp close={closeMFA} closeButton closeWithBackground>
                <div className={styles.mfaContainer}>
                    <h2>Autenticación de dos factores (MFA)</h2>
                    <p>Por favor, ingresa el código de autenticación de dos factores que se te ha enviado.</p>
                    <InputText 
                        title="Código MFA"
                        name="mfa_code"
                        onChange={handleFormChange}
                        value={form?.mfa_code}
                        error={errors?.mfa_code}
                        onBlur={validateMFA}
                        onFocus={clearError}
                    />
                    <div className={styles.buttonContainer}>
                        {!loadingMFA && (
                            <Button
                                text="Verificar código"
                                onClick={handleMFA}
                                loading={loadingMFA}
                            />
                        )}
                        {loadingMFA && <Spinner />}
                    </div>
                    {errorMFA && <p className={styles.errorMessage}>{errorMFA.message}</p>}
                </div>
            </PopUp>
            )}
        </div>
      );
}

export default LoginPage;