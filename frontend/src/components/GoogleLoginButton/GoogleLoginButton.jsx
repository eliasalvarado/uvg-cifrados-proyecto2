import React from 'react';
import PropTypes from 'prop-types';
import styles from './GoogleLoginButton.module.css';
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

GoogleLoginButton.propTypes = {
  handleSuccess: PropTypes.func.isRequired,
  handleError: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.object,
};
