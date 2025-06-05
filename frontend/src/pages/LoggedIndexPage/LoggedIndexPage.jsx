import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProfilePage from '../ProfilePage/ProfilePage';
import ChatPage from '../ChatPage/ChatPage';
import EphemeralMessagesPage from '../EphemeralMessagesPage/EphemeralMessagesPage';

function LoggedIndexPage() {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

export default LoggedIndexPage;
