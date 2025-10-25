import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import AddButton from "../AddButton/AddButton";
import ChatItem from "../ChatItem/ChatItem";
import styles from "./ChatRoomsList.module.css";
import { scrollbarGray } from "../../styles/scrollbar.module.css";
import JoinButton from "../JoinButton/JoinButton";
import useCreateGroup from "../../hooks/groupChat/useCreateGroup";
import useChatState from "../../hooks/useChatState";
import useJoinGroup from "../../hooks/groupChat/useJoinGroup";
import useJoinGroupSocket from "../../hooks/groupChat/useJoinGroupSocket";

/**
 * Componente que muestra una lista de salas de chat y permite unirse a nuevas salas y seleccionar salas existentes.
 * 
 * @param {Object} props - Las propiedades del componente.
 * @param {Function} [props.onSelectedRoomChange] - Función que se llama cuando la sala seleccionada cambia, proporcionando la sala seleccionada como argumento.
 */
function ChatRoomsList({ onSelectedRoomChange = null }) {
	const [selectedRoom, setSelectedRoom] = useState(null);

	const { createGroup, result: successCreateGroup, error: errorCreateGroup } = useCreateGroup();
	const { joinGroup, result: successJoinGroup, error: errorJoinGroup } = useJoinGroup();
	const { createEmptyGroup, groups, groupMessages } = useChatState(); 
	const joinGroupSocket = useJoinGroupSocket();

	const handleCreateRoom = () => {
		const name = prompt("Ingrese el nombre del nuevo grupo:");
		if (!name) return;
		
		createGroup({name});
	}

	const handleJoinRoom = () => {
		const groupName = prompt("Ingrese el nombre del grupo al que desea unirse:");
		if (!groupName) return;
		joinGroup({ groupName })
	};

	useEffect(() => {
		if (onSelectedRoomChange) onSelectedRoomChange(selectedRoom);
	}, [selectedRoom]);

	useEffect(() => {

		if(!successCreateGroup) return;
		const { groupId, name, creatorId, key } = successCreateGroup;
		alert("Grupo creado exitosamente!")

		// Añadir el nuevo grupo a la lista de grupos
		createEmptyGroup({ groupId, name, creatorId, key });

		// Seleccionar automáticamente el nuevo grupo
		setSelectedRoom(groupId);

		// Unirse al grupo en el socket
		joinGroupSocket(groupId);
		
	}, [successCreateGroup]);

	useEffect(() => {

		if (!errorCreateGroup) return;
		alert(`Error al crear el grupo: ${errorCreateGroup?.message || "Error desconocido"}`);
		
	}, [errorCreateGroup]);


	useEffect(() => {

		if (!successJoinGroup) return;
		const { groupId, name, newMemberId, key } = successJoinGroup;
		alert("Unido al grupo exitosamente!");

		// Añadir el nuevo grupo a la lista de grupos
		createEmptyGroup({ groupId, name, creatorId: newMemberId, key });

		// Seleccionar automáticamente el nuevo grupo
		setSelectedRoom(groupId);
		
		if (onSelectedRoomChange) onSelectedRoomChange(groupId);

		// Unirse al grupo en el socket
		joinGroupSocket(groupId);
		
	}, [successJoinGroup]);
	
	useEffect(() => {

		if (!errorJoinGroup) return;
		alert(`Error al unirse al grupo: ${errorJoinGroup?.message || "Error desconocido"}`);
		
	}, [errorJoinGroup]);

	return (
		<div className={styles.roomsList}>
			<header>
				<h1 className={styles.title}>Grupos</h1>
				<div className={styles.buttonsContainer}>
					<JoinButton onClick={handleJoinRoom} />
					<AddButton onClick={handleCreateRoom} />
				</div>
			</header>

			<ul className={`${styles.listContainer} ${scrollbarGray}`}>
				{Object.entries(groups)
				.sort(([groupIdA], [groupIdB]) => {
					const lastMessageA = groupMessages[groupIdA]?.at(-1);
					const lastMessageB = groupMessages[groupIdB]?.at(-1);

					if (!lastMessageA && !lastMessageB) return groupIdB - groupIdA; // Ambos grupos sin mensajes, ordenar por ID descendente
					if (!lastMessageA) return 1; // A tiene mensajes, B no, A va primero
					if (!lastMessageB) return -1; // B tiene mensajes, A no, B va primero

					return new Date(lastMessageB.datetime) - new Date(lastMessageA.datetime); // Ordenar por fecha del último mensaje (descendente)
				})
				.map(([groupId, group]) => {
					
					const lastMessage = groupMessages[groupId]?.at(-1);
					const lastMessageUser = lastMessage?.sent ? "yo" : lastMessage?.username ?? "";
					const lastMessageText = lastMessage?.message ?? "";

					const message = lastMessageUser && lastMessageText
						? `${lastMessageUser}: ${lastMessageText}`
						: lastMessageText

					return (
					<ChatItem
						key={groupId}
						id={groupId}
						user={group.name}
						onClick={() => setSelectedRoom(groupId)}
						selected={selectedRoom === groupId}
						message={message}
						date={lastMessage?.datetime}
					/>
					)
				})}
			</ul>
		</div>
	);
}

export default ChatRoomsList;

ChatRoomsList.propTypes = {
	onSelectedRoomChange: PropTypes.func,
};
