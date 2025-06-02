import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import AddButton from '../AddButton/AddButton';
import ChatItem from '../ChatItem/ChatItem';
import styles from './ChatsList.module.css';
import { scrollbarGray } from '../../styles/scrollbar.module.css';
import useChatState from '../../hooks/useChatState';
import useSearchUser from '../../hooks/user/useSearchUser';

/**
 * Componente que muestra una lista de chats, permitiendo seleccionar un chat y agregar nuevos chats.
 * 
 * @param {Object} props - Las propiedades del componente.
 * @param {Function} [props.onSelectedUserChange] - Función que se llama cuando el usuario seleccionado cambia, proporcionando el usuario seleccionado como argumento.
 */
function ChatsList({ onSelectedUserChange = null }) {

  const { messages, createEmptyChat, users } = useChatState();
  const [selectedUser, setSelectedUser] = useState(null);
  const { searchUser, result: userResult, error: errorResult } = useSearchUser();

  useEffect(() => {
    if (onSelectedUserChange) onSelectedUserChange(selectedUser);
  }, [onSelectedUserChange, selectedUser]);

  useEffect(() => {
    // Se encontró un usuario, se crea un chat vacío con ese usuario
    if (!userResult) return;
    const { result: user } = userResult;

    createEmptyChat({
      userId: user.id,
      username: user.username,
      email: user.email,
      rsaPublicKey: user.rsaPublicKey
    });

  }, [userResult]);

  useEffect(() => {
    // Si hay un error al buscar el usuario, mostrar una alerta
    if (!errorResult) return;
    alert("No se encontró el usuario. Intenta con otro nombre o email.");
  }, [errorResult]);

  const handleCreateChat = () => {
    const userSearchText = prompt("Ingrese el nombre del usuario:");
    if (!userSearchText) return
    searchUser(userSearchText)
  }
  return (
    <div className={styles.chatsList}>
      <header>
        <h1 className={styles.title}>Chats</h1>
        <AddButton onClick={handleCreateChat} />
      </header>

      <ul className={`${styles.listContainer} ${scrollbarGray}`}>
        {Object.keys(messages)
          .sort((userId1, userId2) => {
            // Ordenar por fecha del último mensaje (chats nuevos van al inicio)
            const lastMessage1 = messages[userId1].slice(-1)[0];
            const lastMessage2 = messages[userId2].slice(-1)[0];
            if (lastMessage1 === undefined && lastMessage2 === undefined) return userId1 < userId2 ? -1 : 1; // Si no hay mensajes, ordenar por nombre
            if (lastMessage1 === undefined) return -1; // Mantener los chats sin mensajes al inicio
            if (lastMessage2 === undefined) return -1;
            return lastMessage2.date - lastMessage1.date; // Ordenar por fecha del último mensaje
          })
          .map((userId) => {

            const lastMessage = messages[userId].slice(-1)[0];

            return (
              <ChatItem
                key={userId}
                userId={userId}
                user={users[userId]?.username || ""}
                message={lastMessage?.message || ""}
                showStatus={false}
                date={lastMessage?.datetime}
                onClick={setSelectedUser}
                selected={selectedUser === userId}
              />
            );
          })}
      </ul>
    </div>
  );
}

export default ChatsList;

ChatsList.propTypes = {
  onSelectedUserChange: PropTypes.func,
};