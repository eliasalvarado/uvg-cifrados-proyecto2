import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import AddButton from '../AddButton/AddButton';
import ChatItem from '../ChatItem/ChatItem';
import styles from './ChatsList.module.css';
import {scrollbarGray} from '../../styles/scrollbar.module.css';
import useGetChats from '../../hooks/simpleChat/useGetChats';

/**
 * Componente que muestra una lista de chats, permitiendo seleccionar un chat y agregar nuevos chats.
 * 
 * @param {Object} props - Las propiedades del componente.
 * @param {Function} [props.onSelectedUserChange] - Función que se llama cuando el usuario seleccionado cambia, proporcionando el usuario seleccionado como argumento.
 */
function ChatsList({onSelectedUserChange=null}) {

  const {getChats, result: chatsList} = useGetChats();

  const [selectedUser, setSelectedUser] = useState(null);
  
  useEffect(() => {
    getChats();
  }, []);

  useEffect(() => {
    if(onSelectedUserChange) onSelectedUserChange(selectedUser);
  }, [selectedUser]);

  const handleCreateChat = () => {
    const user = prompt("Ingrese el nombre del usuario:");
    if(!user) return
    //createEmptyChat(user);
  }
  console.log(chatsList)
  return (
		<div className={styles.chatsList}>
			<header>
				<h1 className={styles.title}>Chats</h1>
				<AddButton onClick={handleCreateChat}/>
			</header>

			<ul className={`${styles.listContainer} ${scrollbarGray}`}>
				{chatsList && chatsList.result.map((msg) => <ChatItem
							key={msg.user_id}
              userId={msg.user_id}
							user={msg.username}
							message={msg.message}
							active={false}
							showStatus={false}
              date={msg.created_at}
              onClick={setSelectedUser}
              selected={selectedUser === msg.user_id}
						/>)}
			</ul>
		</div>
	);
}

export default ChatsList;

ChatsList.propTypes = {
  onSelectedUserChange: PropTypes.func,
};