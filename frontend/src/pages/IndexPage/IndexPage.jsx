import React from 'react';
import useToken from '@hooks/useToken';
import HomePage from '../HomePage/HomePage';
import LoginPage from '../LoginPage/LoginPage';

function IndexPage() {
  const token = useToken();
  let page = <LoginPage/>;
  if (token) {
    page = <HomePage/>;
  }  
  return (
    <>
      {page}
    </>
  );
}

export default IndexPage;
