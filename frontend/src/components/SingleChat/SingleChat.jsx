import PropTypes from "prop-types";
import ChatInput from "../ChatInput/ChatInput";
import Message from "../Message/Message";
import styles from "./SingleChat.module.css";
import { scrollbarGray } from "../../styles/scrollbar.module.css";
import { useEffect, useRef } from "react";
import useChatState from "../../hooks/useChatState";
import useSendMessage from "../../hooks/simpleChat/useSendMessage";
import getMessageObject from "../../helpers/dto/getMessageObject";

/**
 * Componente de chat individual que maneja la interacción del usuario con otro usuario específico.
 * 
 * Este componente permite enviar mensajes, manejar la visualización de mensajes, enviar archivos, y 
 * agregar contactos. También se asegura de que el chat se desplace hacia abajo automáticamente 
 * cuando se recibe un nuevo mensaje.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {string} props.user - El identificador del usuario con el que se está chateando.
 * @param {string} props.username - El nombre del usuario con el que se está chateando.
 */
function SingleChat({ userId, username }) {

	const { messages, addSingleChatMessage } = useChatState();

	const forceScrollRef = useRef(true);
	const chatContainerRef = useRef();
	const lastChildRef = useRef();

	const {sendMessage } = useSendMessage();

	const scrollToBottom = () => {
		chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
	}
	const handleSend = (text) => {
		scrollToBottom(); // Al mandar mensaje, scroll al final obligatorio
		sendMessage({targetUserId: userId, message: text});

		const message = getMessageObject({
			from: null, // null significa que es el usuario actual
			to: userId,
			message: text,
			datetime: new Date(),
			sent: true // true significa que el mensaje fue enviado por el usuario actual
		});
		addSingleChatMessage(message);
	};

	useEffect(() => {
		if (!userId) return;
		forceScrollRef.current = true;
	}, [userId]);

	useEffect(() => {
		if (!userId) return;
		// Enviar al abrir al chat (o cambiar de chat)
		forceScrollRef.current = true;
	}, [userId]);

	useEffect(() => {

		if (chatContainerRef.current && lastChildRef.current) {

			if (forceScrollRef.current) {
				// Si es la primera vez que se abre el chat, hacer scroll al final
				scrollToBottom();
				forceScrollRef.current = false;
			}

			// Cuando se recibe un mensaje, verificar si el último mensaje es visible
			// si lo es, hacer scroll al final

			const { scrollTop, clientHeight } = chatContainerRef.current;
			const lastChildOffsetTop = lastChildRef.current.offsetTop;

			if (scrollTop + clientHeight >= lastChildOffsetTop - 100) {
				scrollToBottom();
			}
		}
	}, [messages[userId]]);


	return (
		<div
			className={styles.chat}
		>
			<header className={styles.chatHeader}>
				<h3 className={styles.title}>{username}</h3>
			</header>
			<div
				className={`${styles.chatsContainer} ${scrollbarGray}`}
				ref={chatContainerRef}
			>
				<ul className={styles.messagesList}>
					{messages[userId] &&
						messages[userId].map((message, index) => {
							const firstMessage = index === 0 || messages[userId][index - 1].from !== message.from;
							return (
								<Message
									key={index}
									left={!message.sent}
									message={message.message}
									date={message.datetime?.toString()}
									showTriangle={firstMessage}
									refObj={index === messages[userId].length - 1 ? lastChildRef : null}
								/>
							);
						})}
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
	username: PropTypes.string.isRequired
};
