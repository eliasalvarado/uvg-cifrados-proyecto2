import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import MenuIcon from '../../../assets/icons/MenuIcon';
import styles from './TopBar.module.css';
import UserInfo from '../UserInfo/UserInfo';
/**
*
* @TopBar: Es un componente que establece la barra superior de cualquier página autenticada,
* posee un botón destinado a desplegar cualquier menú por medio del parámetro de función toggler,
* se deberá proveer de un logo y el nombre del becado
*
* @param {function} toggler: Función destinada a retraer y desplegar algo
* @param {string | JSXElement}: Fuente del logotipo a mostrar
* @param {string} name: Nombre del becado
* @param {boolean} showToggler: Booleano dedicado a mostrar el hamburger menu o no
* @param {string} idUser: Id del becado.
* @param {boolean} hasImage: Indica si el usuario posee foto de perfil o no.
*
*/
function TopBar({
  toggler, logo, name, showToggler, idUser, hasImage, menuButtonRef,
}) {
  return (
    <nav className={styles.TopBar}>
      <div className={styles.mainBar}>

        {/* Botón toggle */}
        {showToggler ? (
          <button className={styles.icon} onClick={toggler} type="button" ref={menuButtonRef}>
            <MenuIcon fill="none" stroke="#ffffff" />
          </button>
        ) : undefined}

        {/* Botón de logotipo */}
        <Link to="/" className={styles.logoButton}>
          <img src={logo} alt="Logo de ASIGBO" />
        </Link>

      </div>

      {/* Nombre e ícono del becado */}
      <UserInfo className={styles.userInfo} name={name} idUser={idUser} hasImage={hasImage} />

    </nav>
  );
}

TopBar.defaultProps = {
  // eslint-disable-next-line no-console
  toggler: () => console.log('No se ha establecido un callback para despliegue'),
  showToggler: true,
  logo: '',
  name: '',
  idUser: null,
  hasImage: false,
  menuButtonRef: null,
};

TopBar.propTypes = {
  showToggler: PropTypes.bool,
  toggler: PropTypes.func,
  logo: PropTypes.string,
  name: PropTypes.string,
  idUser: PropTypes.string,
  hasImage: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  menuButtonRef: PropTypes.any,
};

export default TopBar;
