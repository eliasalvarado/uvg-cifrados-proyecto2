import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import styles from "./NavBar.module.css";
import SessionContext from "../../context/SessionContext";
import { IoChatbubbles as ChatIcon , IoExitSharp as ExitIcon } from "react-icons/io5";
import GroupChatIcon from "../../assets/icons/group-chat.svg";
import { RiContactsBook3Fill as ContactIcon } from "react-icons/ri";
import { MdAccountCircle as ProfileIcon , MdMessage as EphemeralIcon , MdToken as BlockChainIcon } from "react-icons/md";


/**
 * Componente de barra de navegación para una aplicación de chat.
 *
 * Proporciona accesos directos a diferentes secciones de la aplicación:
 * - Chats activos
 * - Grupos
 * - Contactos
 * - Perfil
 * - Mensajes efímeros
 * - Salir
 *
 * Cada opción se representa como un botón que ejecuta una función de callback cuando es clickeado o activado con el teclado.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {function} props.onChatOptionClick - Función callback al hacer clic en la opción de chats activos.
 * @param {function} props.onGroupChatOptionClick - Función callback al hacer clic en la opción de grupos.
 * @param {function} props.onContactsOptionClick - Función callback al hacer clic en la opción de contactos.
 * @param {function} props.onProfileOptionClick - Función callback al hacer clic en la opción de perfil.
 * @param {function} props.onBlockChainOptionClick - Función callback al hacer clic en la opción de blockchain.
 */
function NavBar({
	onChatOptionClick,
	onGroupChatOptionClick,
	onContactsOptionClick,
	onProfileOptionClick,
	onEphemeralMessagesOptionClick, 
	onBlockChainOptionClick
}) {

	const { clearToken } = useContext(SessionContext);
    const navigate = useNavigate();

	const logout = () => {
		console.log("Logout");
        localStorage.removeItem('token');
		localStorage.removeItem('privateKeyECDSA');
		localStorage.removeItem('privateKeyRSA');
		localStorage.removeItem('publicKeyRSA');
		localStorage.removeItem('publicKeyECDSA');
        clearToken();
        
        navigate("/", { replace: true });
    }

	return (
		<nav className={styles.navBar}>
			<ul>
				<li>
					<button type="button" className={styles.navButton} onClick={onChatOptionClick}>
						<ChatIcon className={styles.icon} />
						<span>Chats activos</span>
					</button>
				</li>
				<li>
					<button type="button" className={styles.navButton} onClick={onGroupChatOptionClick}>
						<img
							src={GroupChatIcon}
							alt="Group chat"
							className={styles.groupChatIcon}
						/>
						<span>Grupos</span>
					</button>
				</li>
				<li>
					<button type="button" className={styles.navButton} onClick={onContactsOptionClick}>
						<ContactIcon className={styles.icon} />
						<span>Contactos</span>
					</button>
				</li>
				<li>
					<button type="button" className={styles.navButton} onClick={onProfileOptionClick}>
						<ProfileIcon className={styles.icon} />
						<span>Perfil</span>
					</button>
				</li>
				<li>
					<button type="button" className={styles.navButton} onClick={onEphemeralMessagesOptionClick}>
						<EphemeralIcon className={styles.icon} />
						<span>Mensajes efímeros</span>
					</button>
				</li>
				<li>
					<button type="button" className={styles.navButton} onClick={onBlockChainOptionClick}>
						<BlockChainIcon className={styles.icon} />
						<span>Blockchain</span>
					</button>
				</li>
				<li>
					<button type="button" className={styles.navButton} onClick={logout}>
						<ExitIcon className={styles.icon} />
						<span>Salir</span>
					</button>
				</li>
			</ul>
		</nav>
	);
}

export default NavBar;

NavBar.propTypes = {
	onChatOptionClick: PropTypes.func.isRequired,
	onGroupChatOptionClick: PropTypes.func.isRequired,
	onContactsOptionClick: PropTypes.func.isRequired,
	onProfileOptionClick: PropTypes.func.isRequired,
	onEphemeralMessagesOptionClick: PropTypes.func.isRequired,
	onBlockChainOptionClick: PropTypes.func.isRequired,
};
