import { useContext } from 'react';
import SocketContext from '../context/SocketContext';

function useSocket() {
  const { socket } = useContext(SocketContext);
  return socket;
}

export default useSocket;
