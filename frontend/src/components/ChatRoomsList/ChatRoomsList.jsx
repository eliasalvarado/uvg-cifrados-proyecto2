import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import AddButton from "../AddButton/AddButton";
import ChatItem from "../ChatItem/ChatItem";
import styles from "./ChatRoomsList.module.css";
import { scrollbarGray } from "../../styles/scrollbar.module.css";
import JoinButton from "../JoinButton/JoinButton";
import useCreateGroup from "../../hooks/groupChat/useSendMessage";
import useChatState from "../../hooks/useChatState";

/**
 * Componente que muestra una lista de salas de chat y permite unirse a nuevas salas y seleccionar salas existentes.
 * 
 * @param {Object} props - Las propiedades del componente.
 * @param {Function} [props.onSelectedRoomChange] - Función que se llama cuando la sala seleccionada cambia, proporcionando la sala seleccionada como argumento.
 */
function ChatRoomsList({ onSelectedRoomChange = null }) {
	const [selectedRoom, setSelectedRoom] = useState(null);

	const { createGroup, result: successCreateGroup, error: errorCreateGroup } = useCreateGroup();
	const { createEmptyGroup, groups } = useChatState(); 

	const handleCreateRoom = () => {
		const name = prompt("Ingrese el nombre del nuevo grupo:");
		if (!name) return;
		createGroup({name});
	}

	const handleJoinRoom = () => {
		const room = prompt("Ingrese el nombre del grupo al que desea unirse:");
		if (!room) return;
		// joinRoom(room, session.user);
	};

	useEffect(() => {
		if (onSelectedRoomChange) onSelectedRoomChange(selectedRoom);
	}, [selectedRoom]);

	useEffect(() => {

		if(!successCreateGroup) return;
		const { groupId, name, creatorId } = successCreateGroup;
		alert("Grupo creado exitosamente!")

		// Añadir el nuevo grupo a la lista de grupos
		createEmptyGroup({ groupId, name, creatorId });

		// Seleccionar automáticamente el nuevo grupo
		setSelectedRoom(groupId);
		
	}, [successCreateGroup]);


	useEffect(() => {

		if (!errorCreateGroup) return;
		alert(`Error al crear el grupo: ${errorCreateGroup?.message || "Error desconocido"}`);
		
	}, [errorCreateGroup]);

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
				{Object.entries(groups).map(([groupId, group]) => (
					<ChatItem
						key={groupId}
						id={groupId}
						user={group.name}
						onClick={() => setSelectedRoom(groupId)}
						selected={selectedRoom === groupId}
					/>
				))}
			</ul>
		</div>
	);
}

export default ChatRoomsList;

ChatRoomsList.propTypes = {
	onSelectedRoomChange: PropTypes.func,
};
