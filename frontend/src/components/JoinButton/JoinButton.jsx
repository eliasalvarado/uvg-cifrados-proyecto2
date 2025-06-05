import PropTypes from 'prop-types';
import styles from './joinButton.module.css';
import { MdGroupAdd as JoinIcon} from "react-icons/md";

function JoinButton({onClick, title="Unirse"}) {
  return (
    <button type='button' className={styles.addButton} onClick={onClick} title={title}>
      <JoinIcon />
    </button>
  );
}

export default JoinButton;

JoinButton.propTypes = {
  onClick: PropTypes.func,
  title: PropTypes.string,
};
