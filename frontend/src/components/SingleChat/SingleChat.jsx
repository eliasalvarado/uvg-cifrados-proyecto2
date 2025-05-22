import PropTypes from "prop-types";
import ChatInput from "../ChatInput/ChatInput";
import Message from "../Message/Message";
import styles from "./SingleChat.module.css";
import { scrollbarGray } from "../../styles/scrollbar.module.css";
import { useEffect, useRef } from "react";

/**
 * Componente de chat individual que maneja la interacción del usuario con otro usuario específico.
 * 
 * Este componente permite enviar mensajes, manejar la visualización de mensajes, enviar archivos, y 
 * agregar contactos. También se asegura de que el chat se desplace hacia abajo automáticamente 
 * cuando se recibe un nuevo mensaje.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {string} props.user - El identificador del usuario con el que se está chateando.
 */
function SingleChat({ user }) {


	const forceScrollRef = useRef(true);

	const chatContainerRef = useRef();
  const lastChildRef = useRef();

  const scrollToBottom = () => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }

	const handleSend = (text) => {
    scrollToBottom(); // Al mandar mensaje, scroll al final obligatorio
		//sendMessage(user, text);
	};

  useEffect(() => {
		if(!user) return;
    // Enviar al abrir al chat (o cambiar de chat)
    //sendViewedConfirmation(user);
		forceScrollRef.current = true;
  }, [user]);

	// useEffect(() => {

    // if (chatContainerRef.current && lastChildRef.current) {

    //   if(forceScrollRef.current){
    //     // Si es la primera vez que se abre el chat, hacer scroll al final
    //     scrollToBottom();
    //     forceScrollRef.current = false;
    //   }

    //   // Cuando se recibe un mensaje, verificar si el último mensaje es visible
    //   // si lo es, hacer scroll al final

    //   const { scrollTop, clientHeight} = chatContainerRef.current;
    //   const lastChildOffsetTop = lastChildRef.current.offsetTop;

    //   if (scrollTop + clientHeight >= lastChildOffsetTop - 100) {
    //     scrollToBottom();
    //   }
    // }
	// }, [messages[user]]);

	return (
		<div
			className={styles.chat}
		>
			<header className={styles.chatHeader}>
				<h3 className={styles.title}>{user}</h3>
			</header>
			<div
				className={`${styles.chatsContainer} ${scrollbarGray}`}
				ref={chatContainerRef}
			>
				<ul className={styles.messagesList}>
					{/* {messages[user] &&
						messages[user].map((message, index) => {
							const firstMessage = index === 0 || messages[user][index - 1].sent !== message.sent;
							return (
								<Message
									key={index}
									left={!message.sent}
									message={message.message}
									date={message.date.toString()}
									viewed={message.viewed}
									showTriangle={firstMessage}
									refObj={index === messages[user].length - 1 ? lastChildRef : null}
								/>
							);
						})} */}
				</ul>
			</div>
			<ChatInput
				onSend={handleSend}
			/>
		</div>
	);
}

export default SingleChat;

SingleChat.propTypes = {
	user: PropTypes.string.isRequired,
};
