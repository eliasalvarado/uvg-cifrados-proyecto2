import styles from './ChatPage.module.css';
import NavBar from '../../components/NavBar/NavBar';
import ChatsList from '../../components/ChatsList/ChatsList';
import SingleChat from '../../components/SingleChat/SingleChat';
import ProfilePage from '../ProfilePage/ProfilePage';
import { useState } from 'react';
import ChatRoomsList from '../../components/ChatRoomsList/ChatRoomsList';
import RoomChat from '../../components/RoomChat/RoomChat';
import EphemeralMessages from '../../components/EphemeralMessages/EphemeralMessages';
import BlockchainViewer from '../../components/Blockchain/BlockchainViewer';
import useChatState from '../../hooks/useChatState';

const menuOption = {
  CHATS: 'CHATS',
  GROUPS: 'GROUPS',
  CONTACTS: 'CONTACTS',
  PROFILE: 'PROFILE',
  EPHEMERAL_MESSAGES: 'EPHEMERAL_MESSAGES',
  BLOCKCHAIN: 'BLOCKCHAIN',
};
function ChatPage() {

  const [selectedOption, setSelectedOption] = useState(menuOption.CHATS);
  const [currentSingleChat, setCurrentSingleChat] = useState(null);
  const [currentGroupChat, setCurrentGroupChat] = useState(null);
  const { users, groups } = useChatState();


  const handleSingleChatSelected = (user) => {
    setCurrentSingleChat(user);
    setCurrentGroupChat(null);
  }

  const handleRoomChatSelected = (room) => {
    setCurrentGroupChat(room);
    setCurrentSingleChat(null);
  }

  console.log(users)

  return (
    <div className={styles.chatPage}>
      <NavBar 
        onChatOptionClick={() => setSelectedOption(menuOption.CHATS)}
        onGroupChatOptionClick={() => setSelectedOption(menuOption.GROUPS)}
        onProfileOptionClick={() => setSelectedOption(menuOption.PROFILE)}
        onEphemeralMessagesOptionClick={() => setSelectedOption(menuOption.EPHEMERAL_MESSAGES)}
        onBlockChainOptionClick={() => setSelectedOption(menuOption.BLOCKCHAIN)}
        onExitOptionClick={() => null}
      />
      {selectedOption === menuOption.CHATS && <ChatsList onSelectedUserChange={handleSingleChatSelected}/>}
      {selectedOption === menuOption.GROUPS && <ChatRoomsList onSelectedRoomChange={handleRoomChatSelected}/> }
      {selectedOption === menuOption.PROFILE && <ProfilePage />}
      {selectedOption === menuOption.EPHEMERAL_MESSAGES && <EphemeralMessages />}
      {selectedOption === menuOption.BLOCKCHAIN && <BlockchainViewer />}
      {currentSingleChat && <SingleChat userId={currentSingleChat} username={users[currentSingleChat]?.username} />}
      {currentGroupChat && <RoomChat groupId={currentGroupChat} name={groups[currentGroupChat]?.name}/>}

    </div>
  );
}

export default ChatPage;

ChatPage.propTypes = {

};