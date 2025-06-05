import PropTypes from "prop-types";
import styles from "./Message.module.css";
import { IoCheckmarkDone as CheckIcon } from "react-icons/io5";
import dayjs from "dayjs";

/**
 * Componente de mensaje que representa un mensaje individual en una conversación de chat.
 *
 * Este componente maneja diferentes tipos de contenido de mensaje, incluyendo texto, imágenes, enlaces y archivos adjuntos.
 * También muestra la hora del mensaje y un indicador de mensaje visto si corresponde.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {boolean} props.left - Indica si el mensaje es del usuario actual o de otro. `true` si es de otro usuario (a la izquierda).
 * @param {string} props.user - El nombre del usuario que envió el mensaje, mostrado solo para mensajes a la izquierda.
 * @param {string} props.message - El contenido del mensaje. Puede ser texto, un enlace, o la URL de una imagen o archivo.
 * @param {string} props.date - La fecha y hora en que se envió el mensaje.
 * @param {boolean} props.showTriangle - Indica si se debe mostrar un triángulo que apunta a la burbuja del mensaje.
 * @param {boolean} props.viewed - Indica si el mensaje ha sido visto por el destinatario.
 * @param {Object} props.refObj - Referencia para el contenedor del mensaje para manejar el desplazamiento automático.
 * @param {boolean} props.showViewed - Indica si se debe mostrar el icono de mensaje visto.
 */
function Message({
	left = true,
	user = null,
	message,
	date,
	showTriangle = false,
	viewed = false,
	refObj = null,
	showViewed = true,
	verified = null
}) {
	const formattedTime = dayjs(date).format("HH:mm");

	return (
		<li
			className={`${styles.message} ${left ? styles.left : styles.right} ${
				showTriangle ? styles.triangle : ""
			}`}
			ref={refObj}
		>
			<div className={styles.bubble}>
				{user && left && <span className={styles.user}>{user}</span>}
				<span className={styles.messageText}>
					{message}
				</span>
				<div className={styles.messageFooter}>
					{verified && <span style={{color:"green",width:"100%"}}>✅</span>}
					{!verified && <span style={{color:"red",width:"100%"}}>❌</span>}
					<span className={styles.time}>{formattedTime}</span>
					{!left && showViewed && <CheckIcon className={`${styles.checkIcon} ${viewed ? styles.viewed : ""}`} />}
				</div>
			</div>
		</li>
	);
}

export default Message;

Message.propTypes = {
	left: PropTypes.bool,
	user: PropTypes.string,
	message: PropTypes.string.isRequired,
	date: PropTypes.string.isRequired,
	showTriangle: PropTypes.bool,
	viewed: PropTypes.bool,
	refObj: PropTypes.any,
	showViewed: PropTypes.bool,
};
