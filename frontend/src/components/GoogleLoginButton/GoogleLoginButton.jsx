import React from 'react';
import styles from './GoogleLoginButton.module.css';
import { FaGoogle as GoogleIcon} from "react-icons/fa";
import { GoogleLogin } from '@react-oauth/google';
import Spinner from '../Spinner';

const GoogleLoginButton = ({ handleSuccess, handleError, loading, error }) => {

  return (
    <div className={styles.googleLoginButtonContainer}>
    {loading ? (
      <Spinner />
    ) : (
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
      />
    )}
    {error && !loading && (
      <div className={styles.error}>
        <p>Error: {error.message}</p>
      </div>
    )}
    </div>
  );
};

export default GoogleLoginButton;
