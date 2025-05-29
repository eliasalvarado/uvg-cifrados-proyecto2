import React, { useState, useEffect, useContext } from "react";
import styles from "./RegisterPage.module.css";
import useFetch from "../../hooks/useFetch";
import SessionContext from "../../context/SessionContext";
import InputText from "../../components/InputText";
import InputSelect from "../../components/InputSelect";
import Button from "../../components/Button";
import Spinner from "../../components/Spinner";
import { useNavigate } from "react-router-dom";

function RegisterPage() {

    const [form, setForm] = useState({});
    const [errors, setErrors] = useState(null);
    const { refreshToken } = useContext(SessionContext);
    const navigate = useNavigate();

    const {
        callFetch: fetchRegister,
        result: resultRegister,
        loading: loadingRegister,
        error: errorRegister
    } = useFetch();

    const {
        callFetch: fetchKeyGen,
        result: resultKeyGen,
        loading: loadingKeyGen,
        error: errorKeyGen,
        reset: resetKeyGen,
      } = useFetch();

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

    const validateRepeatPassword = () => {
        if (form?.repeatPassword?.trim().length > 0) return true;
        if (form?.repeatPassword === form?.password) return true;
        setErrors((lastValue) => ({ ...lastValue, repeatPassword: "Las contraseñas no coinciden" }));
    }

    const validateAlgorithm = () => {
        if (form?.algorithm?.trim().length > 0) return true;
        setErrors((lastValue) => ({ ...lastValue, algorithm: "El algoritmo de cifrado es requerido" }));
    }

    const clearError = (e) => {
        const field = e.target.name;
        setErrors((lastValue) => ({ ...lastValue, [field]: null }));
    }

    const handleRegister = (e) => {

        e.preventDefault();
        const { username, password, algorithm } = form;
        if (!validateUsername()) return;
        if (!validatePassword()) return;
        if (!validateRepeatPassword()) return;
        if (!validateAlgorithm()) return;

        fetchRegister({
            uri: "/api/user/register",
            method: "POST",
            body: JSON.stringify({ email: username, password, algorithm }),
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    useEffect(() => {
        if (!resultRegister?.token) return;

        // Colocar la llave privada generada en un archivo y descargarla
        const { privateKeyRSA } = resultRegister;
        const blob = new Blob([privateKeyRSA], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'privateKey.pem';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Colocar la llave privada ECDSA generada en un archivo y descargarla
        const { privateKeyECDSA } = resultRegister;
        const blobECDSA = new Blob([privateKeyECDSA], { type: 'text/plain' });
        const urlECDSA = URL.createObjectURL(blobECDSA);
        const linkECDSA = document.createElement('a');
        linkECDSA.href = urlECDSA;
        linkECDSA.download = 'privateKeyECDSA.pem';
        document.body.appendChild(linkECDSA);
        linkECDSA.click();
        document.body.removeChild(linkECDSA);
        URL.revokeObjectURL(urlECDSA);

        localStorage.setItem("token", resultRegister.token);
        refreshToken(resultRegister.token);
        navigate('/');
        
    }, [resultRegister]);


    return (
        <div className={styles.registerPageContainer}>
            <h1>Registrarse</h1>
          <form className={styles.registerForm} onSubmit={handleRegister}>
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
            <InputText 
                title="Repetir contraseña"
                name="repeatPassword"
                onChange={handleFormChange}
                value={form?.repeatPassword}
                error={errors?.repeatPassword}
                onBlur={validateRepeatPassword}
                onFocus={clearError}
                hidden
            />
            <InputSelect
                title="Algoritmo de cifrado de archivos"
                name="algorithm"
                onChange={handleFormChange}
                value={form?.algorithm}
                error={errors?.algorithm}
                onBlur={validateAlgorithm}
                onFocus={clearError}
                options={[
                    { value: "RSA", title: "RSA" },
                    { value: "ECC", title: "ECC" },
                ]}
                placeholder="Selecciona un algoritmo"
            />
            <p className={styles.infoText}>Al registrate, se descargará automáticamente tu llave privada</p>
            <div className={styles.buttonContainer}>
                {!loadingRegister && (
                    <Button
                        text="Registrarse"
                        onClick={handleRegister}
                    />
                )}
                {loadingRegister && <Spinner />}
            </div>
            {errorRegister && <p className={styles.errorMessage}>{errorRegister.message}</p>}
          </form>
        </div>
    );
}

export default RegisterPage;