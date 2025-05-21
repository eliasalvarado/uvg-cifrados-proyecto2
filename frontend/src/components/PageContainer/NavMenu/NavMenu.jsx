import React from 'react';
import PropTypes from 'prop-types';
import { IoLogOut, IoCalendarNumber as CalendarIcon } from 'react-icons/io5';
import { HiHome } from 'react-icons/hi';
import { MdSpaceDashboard as DashboardIcon } from 'react-icons/md';
// import {MdOutlinePayment as PaymentIcon } from 'react-icons/md';
import { NavLink } from 'react-router-dom';
import styles from './NavMenu.module.css';
import UserPicture from '../../UserPicture';
import useLogout from '../../../hooks/useLogout';
import NavMenuButton from '../NavMenuButton/NavMenuButton';
import consts from '../../../helpers/consts';
import LoadingView from '../../LoadingView/LoadingView';

/**
 *
 * @module NavMenu: Es un componente que establece la barra lateral de navegación, únicamente
 * contiene el layout, cualquier función o manipulación externa será en materia de componente.
 *
 * @param {string} idUser: ID del usuario
 * @param {string} name: Nombre del usuario
 * @param {string} className: Clases extras a agregar al elemento padre del componente
 * @param {function} toggler: Función que cerrará el sidebar en caso de existir función de apertura
 * y cierre
 * @param {array[strings]} roles: Permisos del usuario en sesión
 * @param {boolean} hasImage: Indica si el usuario posee foto de perfil o no.
 */

function NavMenu({
  idUser, name, className, toggler, roles, hasImage, menuRef,
}) {
  const { logout, loading } = useLogout();

  const responsibleRoles = [
    consts.roles.admin,
    consts.roles.activityResponsible,
    consts.roles.asigboAreaResponsible,
    consts.roles.promotionResponsible,
  ];

  return (
    <div className={`${styles.navMenu} ${className}`} ref={menuRef}>
      <div className={styles.profile}>
        <UserPicture
          className={styles.profilePicture}
          name={name}
          idUser={idUser}
          hasImage={hasImage}
          onClick={toggler}
        />
        <span className={styles.profileName}>{name}</span>
      </div>
      <div className={styles.buttons}>
        <div className={styles.navButtons}>
          <NavLink to="/" onClick={toggler || undefined}>
            <NavMenuButton icon={<HiHome />} label="Inicio" className={styles.optionIcon} />
          </NavLink>
          {roles?.some((role) => responsibleRoles.includes(role)) && (
            <NavLink to="/panel" onClick={toggler || undefined}>
              <NavMenuButton
                icon={<DashboardIcon />}
                label="Panel de opciones"
                className={styles.optionIcon}
              />
            </NavLink>
          )}
          <NavLink to="/actividad/disponible" onClick={toggler || undefined}>
            <NavMenuButton icon={<CalendarIcon />} label="Actividades" className={styles.optionIcon} />
          </NavLink>
          {/* <NavLink to="/pago" onClick={toggler || undefined}>
            <NavMenuButton icon={<PaymentIcon />} label="Pagos" className={styles.optionIcon} />
          </NavLink> */}

        </div>
        <div className={styles.sessionButtons}>
          <NavMenuButton
            icon={<IoLogOut />}
            clickCallback={logout}
            label="Cerrar Sesión"
            className={styles.logOut}
          />
        </div>
      </div>

      {loading && <LoadingView />}
    </div>
  );
}

NavMenu.propTypes = {
  idUser: PropTypes.string,
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  toggler: PropTypes.func,
  roles: PropTypes.arrayOf(PropTypes.string),
  hasImage: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  menuRef: PropTypes.any,
};

NavMenu.defaultProps = {
  idUser: null,
  className: undefined,
  toggler: undefined,
  roles: null,
  hasImage: false,
  menuRef: null,
};

export default NavMenu;
