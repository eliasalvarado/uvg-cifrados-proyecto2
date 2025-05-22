import React from 'react';
import styles from './GoogleLoginButton.module.css';
import { FaGoogle as GoogleIcon} from "react-icons/fa";

const GoogleLoginButton = () => {
  const handleLogin = () => {
    // Redireccionar al backend para iniciar el flujo OAuth con Google
    window.location.href = 'http://localhost:3000/api/oauth/google/';
  };

  return (
    <div className={styles.googleLoginButton} onClick={handleLogin}>
        <GoogleIcon className={styles.googleIcon} />

        <span className={styles.googleLoginText}>
            Iniciar sesión con Google
        </span>
    </div>
  );
};

export default GoogleLoginButton;
