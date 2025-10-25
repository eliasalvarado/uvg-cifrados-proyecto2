import { BrowserRouter as Router } from 'react-router-dom';
import IndexPage from '../../pages/IndexPage/IndexPage';
import { SessionProvider } from '../../context/SessionContext';
import { ChatProvider } from '../../context/ChatContext';
import { SocketProvider } from '../../context/SocketContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <SessionProvider>
        <ChatProvider>
          <SocketProvider>
            <Router>

              <IndexPage />

            </Router>
          </SocketProvider>
        </ChatProvider>
      </SessionProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
