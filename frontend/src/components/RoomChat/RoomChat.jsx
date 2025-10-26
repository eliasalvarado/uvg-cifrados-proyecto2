import PropTypes from "prop-types";
import ChatInput from "../ChatInput/ChatInput";
import Message from "../Message/Message";
import styles from "./RoomChat.module.css";
import { scrollbarGray } from "../../styles/scrollbar.module.css";
import { useEffect, useRef } from "react";
import useChatState from "../../hooks/useChatState";
import useSendGroupMessage from "../../hooks/groupChat/useSendGroupMessage";
import getGroupMessageObject from "../../helpers/dto/getGroupMessageObject";

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
function RoomChat({ groupId, name }) {

	const { groupMessages, addGroupChatMessage } = useChatState();

	const {sendGroupMessage, error: errorSendGroupMessage} = useSendGroupMessage();

	const chatContainerRef = useRef();
	const lastChildRef = useRef();
	const forceScrollRef = useRef(true);

	const scrollToBottom = () => {
		chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
	}

	const handleSend = (message) => {
		forceScrollRef.current = true; // Forzar scroll al final al recibir mensajes
		sendGroupMessage({ groupId, message });

		const messageObject = getGroupMessageObject({
			message,
			userId: null,
			datetime: new Date(),
			sent: true,
			verified: null
		})

		addGroupChatMessage(groupId, messageObject);
	};



	useEffect(() => {
		// Enviar al abrir al chat
		//markAllRoomMessagesAsViewed(room);
		scrollToBottom();
	}, [groupId]);

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
	}, [groupMessages[groupId]]);

	useEffect(() => {
		if (errorSendGroupMessage) {
			console.error("Error al enviar el mensaje de grupo:", errorSendGroupMessage);
		}
	}, [errorSendGroupMessage]);

	return (
		<div
			className={styles.chat}
		>
			<header className={styles.chatHeader}>
				<h3 className={styles.title}>{name}</h3>

			</header>
			<div className={styles.chatBody}>
				<div
					className={`${styles.chatsContainer} ${scrollbarGray}`}
					ref={chatContainerRef}
				>
					<ul className={styles.messagesList}>
						{
							groupMessages[groupId]?.map((message, index) => {
								console.log("Message in RoomChat:", message);
								const firstMessage = index === 0 || groupMessages[groupId][index - 1].userId !== message.userId;
								return (
									<Message
										key={message.datetime.toString()}
										left={!message.sent}
										message={message.message}
										date={new Date(message.datetime).toString()}
										showTriangle={firstMessage}
										user={firstMessage ? message.username : null}
										refObj={index === groupMessages[groupId].length - 1 ? lastChildRef : null}
										verified={message.verified}
									/>
								);
							})
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
	groupId: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired
};
