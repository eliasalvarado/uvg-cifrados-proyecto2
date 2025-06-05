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

    const handleFormChange = (e) => {
        const field = e.target.name;
        const { value } = e.target;
        setForm((lastValue) => ({ ...lastValue, [field]: value }));
    };

    const validateEmail = () => {
        const email = form?.email?.trim() || "";
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setErrors((lastValue) => ({ ...lastValue, email: "El correo electrónico es requerido" }));
            return false;
        }
        if (!regex.test(email)) {
            setErrors((lastValue) => ({ ...lastValue, email: "El correo electrónico no es válido" }));
            return false;
        }
        return true;
    }

    const validateUsername = () => {
        if (form?.username?.trim().length > 0) return true;
        setErrors((lastValue) => ({ ...lastValue, username: "El usuario es requerido" }));
    }

    const validatePassword = () => {
        const password = form?.password?.trim() || "";
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!password) {
            setErrors((lastValue) => ({ ...lastValue, password: "La contraseña es requerida" }));
            return false;
        }
        if (!regex.test(password)) {
            setErrors((lastValue) => ({
                ...lastValue,
                password: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"
            }));
            return false;
        }
        return true;
    }

    const validateRepeatPassword = () => {
        if (form?.repeatPassword === form?.password) return true;
        setErrors((lastValue) => ({ ...lastValue, repeatPassword: "Las contraseñas no coinciden" }));
    }

    const clearError = (e) => {
        const field = e.target.name;
        setErrors((lastValue) => ({ ...lastValue, [field]: null }));
    }

    const handleRegister = (e) => {

        e.preventDefault();
        const { email, username, password } = form;
        if (!validateEmail()) return;
        if (!validateUsername()) return;
        if (!validatePassword()) return;
        if (!validateRepeatPassword()) return;

        fetchRegister({
            uri: "/api/user/register",
            method: "POST",
            body: JSON.stringify({ email, username, password }),
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    useEffect(() => {
        if (!resultRegister?.token) return;

        // Guardar llave privada en localStorage
        localStorage.setItem("privateKeyRSA", resultRegister.privateKeyRSA);
        localStorage.setItem("publicKeyRSA", resultRegister.publicKeyRSA);

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
            <h1 className={styles.title}>Registrarse</h1>
          <form className={styles.registerForm} onSubmit={handleRegister}>
            <InputText 
                title="Correo electrónico"
                name="email"
                onChange={handleFormChange}
                value={form?.email}
                error={errors?.email}
                onBlur={validateEmail}
                onFocus={clearError}
            />
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
            <p className={styles.infoText}>Al registrate, se descargará automáticamente tu llave privada</p>
            <div className={styles.buttonContainer}>
                {!loadingRegister && (
                    <Button
                        text="Registrarse"
                        onClick={handleRegister}
                        black
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