import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import AddButton from '../AddButton/AddButton';
import ChatItem from '../ChatItem/ChatItem';
import styles from './ChatsList.module.css';
import {scrollbarGray} from '../../styles/scrollbar.module.css';

/**
 * Componente que muestra una lista de chats, permitiendo seleccionar un chat y agregar nuevos chats.
 * 
 * @param {Object} props - Las propiedades del componente.
 * @param {Function} [props.onSelectedUserChange] - Función que se llama cuando el usuario seleccionado cambia, proporcionando el usuario seleccionado como argumento.
 */
function ChatsList({onSelectedUserChange=null}) {

  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if(onSelectedUserChange) onSelectedUserChange(selectedUser);
  }, [selectedUser]);

  const handleCreateChat = () => {
    const user = prompt("Ingrese el nombre del usuario:");
    if(!user) return
    //createEmptyChat(user);
  }
  return (
		<div className={styles.chatsList}>
			<header>
				<h1 className={styles.title}>Chats</h1>
				<AddButton onClick={handleCreateChat}/>
			</header>

			<ul className={`${styles.listContainer} ${scrollbarGray}`}>
				{/* {Object.keys(messages)
        .sort((user1, user2) => {
          // Ordenar por fecha del último mensaje (chats nuevos van al inicio)
          const lastMessage1 = messages[user1].slice(-1)[0];
          const lastMessage2 = messages[user2].slice(-1)[0];
          if (lastMessage1 === undefined && lastMessage2 === undefined) return user1 < user2 ? -1 : 1; // Si no hay mensajes, ordenar por nombre
          if (lastMessage1 === undefined) return -1; // Mantener los chats sin mensajes al inicio
          if (lastMessage2 === undefined) return -1;
          return lastMessage2.date - lastMessage1.date; // Ordenar por fecha del último mensaje
        })
        .map((user) => {

          const lastMessage = messages[user].slice(-1)[0];
          const notViewdMessages = messages[user].filter((message) => !message.viewed && !message.sent).length;
          const available = userStates[user]?.available === true;
          const isContact = roster[user]?.subscription === 'both';

					return (
						<ChatItem
							key={user}
							user={user}
              alias={roster[user]?.alias}
							message={lastMessage?.message}
							notViewed={notViewdMessages}
							active={available}
							showStatus={isContact}
              date={lastMessage?.date?.toString()}
              onClick={setSelectedUser}
              selected={selectedUser === user}
						/>
					);
				})} */}
			</ul>
		</div>
	);
}

export default ChatsList;

ChatsList.propTypes = {
  onSelectedUserChange: PropTypes.func,
};