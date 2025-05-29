import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import IndexPage from '../../pages/IndexPage/IndexPage';
import RegisterPage from '../../pages/RegisterPage/RegisterPage';
import OAuthSuccessPage from '../../pages/OAuthSuccessPage/OAuthSuccessPage';
import { SessionProvider } from '../../context/SessionContext';
import { ChatProvider } from '../../context/ChatContext';

function App() {
  return (
    <SessionProvider>
      <ChatProvider>
        <Router>

          <IndexPage />

        </Router>
      </ChatProvider>
    </SessionProvider>
  );
}

export default App;
