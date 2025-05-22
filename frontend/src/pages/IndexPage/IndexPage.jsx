import React from 'react';
import useToken from '@hooks/useToken';
import ChatPage from '../ChatPage/ChatPage';
import LoginPage from '../LoginPage/LoginPage';

function IndexPage() {
  const token = useToken();
  let page = <LoginPage/>;
  if (token) {
    page = <ChatPage/>;
  }  
  return (
    <>
      {page}
    </>
  );
}

export default IndexPage;
