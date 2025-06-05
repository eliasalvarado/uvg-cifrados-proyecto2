import useSocket from '../useSocket';

function useJoinGroupSocket() {
  const socket = useSocket();
  
  const joinGroupSocket = (groupId) => {
    socket.emit('join_group_room', { groupId });
  }
  return joinGroupSocket
}

export default useJoinGroupSocket;
