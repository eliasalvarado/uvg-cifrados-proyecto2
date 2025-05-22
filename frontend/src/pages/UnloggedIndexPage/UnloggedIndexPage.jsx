import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from '../LoginPage/LoginPage';
import RegisterPage from '../RegisterPage/RegisterPage';
import OAuthSuccessPage from '../OAuthSuccessPage/OAuthSuccessPage';

function UnloggedIndexPage() {
  return (
    <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth/success" element={<OAuthSuccessPage />} />
    </Routes>
  );
}

export default UnloggedIndexPage;
