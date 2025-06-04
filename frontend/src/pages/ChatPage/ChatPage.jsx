// import PropTypes from 'prop-types';
import styles from './ChatPage.module.css';
import NavBar from '../../components/NavBar/NavBar';
import ChatsList from '../../components/ChatsList/ChatsList';
import SingleChat from '../../components/SingleChat/SingleChat';
import ProfilePage from '../ProfilePage/ProfilePage';
import { useState } from 'react';
import ChatRoomsList from '../../components/ChatRoomsList/ChatRoomsList';
import RoomChat from '../../components/RoomChat/RoomChat';
import useChatState from '../../hooks/useChatState';

const menuOption = {
  CHATS: 'CHATS',
  GROUPS: 'GROUPS',
  CONTACTS: 'CONTACTS',
  PROFILE: 'PROFILE',
};
function ChatPage() {

  const [selectedOption, setSelectedOption] = useState(menuOption.CHATS);
  const [currentSingleChat, setCurrentSingleChat] = useState(null);
  const [currentRoomChat, setCurrentRoomChat] = useState(null);
  const { users } = useChatState();


  const handleSingleChatSelected = (user) => {
    setCurrentSingleChat(user);
    setCurrentRoomChat(null);
  }

  const handleRoomChatSelected = (room) => {
    setCurrentRoomChat(room);
    setCurrentSingleChat(null);
  }

  console.log(users)

  return (
    <div className={styles.chatPage}>
      <NavBar 
        onChatOptionClick={() => setSelectedOption(menuOption.CHATS)}
        onGroupChatOptionClick={() => setSelectedOption(menuOption.GROUPS)}
        onProfileOptionClick={() => setSelectedOption(menuOption.PROFILE)}
        onExitOptionClick={() => null}
      />
      {selectedOption === menuOption.CHATS && <ChatsList onSelectedUserChange={handleSingleChatSelected}/>}
      {selectedOption === menuOption.GROUPS && <ChatRoomsList onSelectedRoomChange={handleRoomChatSelected}/> }
      {selectedOption === menuOption.PROFILE && <ProfilePage />}
      {currentSingleChat && <SingleChat userId={currentSingleChat} username={users[currentSingleChat]?.username} />}
      {currentRoomChat && <RoomChat room={currentRoomChat}/>}

    </div>
  );
}

export default ChatPage;

ChatPage.propTypes = {

};