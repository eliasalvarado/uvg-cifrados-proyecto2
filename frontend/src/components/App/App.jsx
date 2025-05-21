import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IndexPage from '../../pages/IndexPage/IndexPage';
import RegisterPage from '../../pages/RegisterPage/RegisterPage';
import { SessionProvider } from '../../context/SessionContext';

function App() {
  return (
    <SessionProvider>
      <Router>

        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>

      </Router>
    </SessionProvider>
  );
}

export default App;
