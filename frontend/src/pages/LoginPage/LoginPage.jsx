import React, { useContext, useState, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import styles from "./LoginPage.module.css";
import SessionContext from "../../context/SessionContext";
import InputText from "../../components/InputText";
import Button from "../../components/Button";
import GoogleLoginButton from "../../components/GoogleLoginButton";
import Spinner from "../../components/Spinner";
import { Link } from "react-router-dom";

function LoginPage() {

    const [form, setForm] = useState({});
    const [errors, setErrors] = useState(null);
    const { refreshToken } = useContext(SessionContext);

    const {
        callFetch: fetchLogin,
        result: resultLogin,
        loading:loadingLogin,
        error: errorLogin
    } = useFetch();

    const handleLogin = (e) => {

        e.preventDefault();
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

    const clearError = (e) => {
        const field = e.target.name;
        setErrors((lastValue) => ({ ...lastValue, [field]: null }));
    }

    useEffect(() => {
        if (!resultLogin?.token) return;

        localStorage.setItem("token", resultLogin.token);
        refreshToken();

    }, [resultLogin]);

    return (
        <div className={styles.loginPageContainer}>
          <h1>Iniciar sesión</h1>
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
            {errorLogin && <p className={styles.errorMessage}>{errorLogin.message}</p>}
          </form>
          <p className={styles.registerLink}>
            ¿No tienes cuenta? <Link to="/register" className={styles.registerHere}>Regístrate aquí</Link>
          </p>
            <div className={styles.googleLoginContainer}>
                <GoogleLoginButton />
            </div>
        </div>
      );
}

export default LoginPage;