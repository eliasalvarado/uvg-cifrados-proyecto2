import React from 'react';
import useToken from '@hooks/useToken';
import LoggedIndexPage from '../LoggedIndexPage/LoggedIndexPage';
import UnloggedIndexPage from '../UnloggedIndexPage/UnloggedIndexPage';
import useSocket from '../../hooks/useSocket';

function IndexPage() {
  const token = useToken();
  useSocket();
  let page = <UnloggedIndexPage/>;
  if (token) {
    page = <LoggedIndexPage/>;
  }  
  return (
    <>
      {page}
    </>
  );
}

export default IndexPage;
