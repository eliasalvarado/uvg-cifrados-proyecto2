import PropTypes from "prop-types";
import ChatInput from "../ChatInput/ChatInput";
import Message from "../Message/Message";
import styles from "./RoomChat.module.css";
import { scrollbarGray } from "../../styles/scrollbar.module.css";
import { useEffect, useRef } from "react";

/**
 * Componente de chat de sala que maneja la interacción del usuario en una sala de chat específica.
 *
 * Este componente permite a los usuarios enviar mensajes de texto y archivos a la sala, ver los mensajes,
 * y ver los miembros actuales de la sala. También se asegura de que la vista del chat se desplace automáticamente
 * hacia el final cuando se reciben nuevos mensajes.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {string} props.room - El nombre o identificador de la sala de chat.
 */
function RoomChat({ room }) {


	const chatContainerRef = useRef();
  const lastChildRef = useRef();
	const forceScrollRef = useRef(true);

  const scrollToBottom = () => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }

	const handleSend = (text) => {
		//sendRoomMessage(room, text);
		forceScrollRef.current = true; // Forzar scroll al final al recibir mensajes
	};



  useEffect(() => {
    // Enviar al abrir al chat
    //markAllRoomMessagesAsViewed(room);
		scrollToBottom();
  }, [room]);

	useEffect(() => {

    if (chatContainerRef.current && lastChildRef.current) {

      if(forceScrollRef.current) {
        // Si es la primera vez que se abre el chat, hacer scroll al final
        scrollToBottom();
        forceScrollRef.current = false;
      }

      // Cuando se recibe un mensaje, verificar si el último mensaje es visible
      // si lo es, hacer scroll al final

      const { scrollTop, clientHeight} = chatContainerRef.current;
      const lastChildOffsetTop = lastChildRef.current.offsetTop;

      if (scrollTop + clientHeight >= lastChildOffsetTop - 100) {
        scrollToBottom();
      }
    }
	}, [/*rooms*/]);

	return (
		<div
			className={styles.chat}
		>
			<header className={styles.chatHeader}>
				<h3 className={styles.title}>{room}</h3>

			</header>
			<div className={styles.chatBody}>
				<div
					className={`${styles.chatsContainer} ${scrollbarGray}`}
					ref={chatContainerRef}
				>
					<ul className={styles.messagesList}>
						{
							// messages.map((message, index) => {
							// 	const firstMessage = index === 0 || messages[index - 1].nickname !== message.nickname;
							// 	return (
							// 		<Message
							// 			key={index}
							// 			left={message.nickname !== session.user}
							// 			message={message.message}
							// 			date={message.date.toString()}
							// 			showTriangle={firstMessage}
							// 			user={firstMessage ? message.nickname : null}
							// 			refObj={index === messages.length - 1 ? lastChildRef : null}
							// 			showViewed={false}
							// 		/>
							// 	);
							// })
							}
					</ul>
				</div>
				
			</div>
			<ChatInput
				onSend={handleSend}
			/>
		</div>
	);
}

export default RoomChat;

RoomChat.propTypes = {
	room: PropTypes.string.isRequired,
};
