import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import useToken from '@hooks/useToken';
import TopBar from './TopBar/TopBar';
import getTokenPayload from '../../helpers/getTokenPayload';
import styles from './PageContainer.module.css';
import NotFoundPage from '../../pages/NotFoundPage';
import NavMenu from './NavMenu/NavMenu';

/**
 *
 * PageContainer: Componente con TopBar y sidebar de Menú integrados, es en donde se cargará
 * cualquier página autenticada, colocando el contenido como hijo directo de este componente
 *
 * @param {JSXNode} children : Página o páginas que se mostrarán dentro
 *
 */
function PageContainer({ children }) {
  const [isToggled, setIsToggled] = useState(false);
  const [isShown, setIsShown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [payload, setPayload] = useState({});
  const token = useToken();

  const menuRef = useRef();
  const menuButtonRef = useRef();

  // Este efecto obtiene la medida de la pantalla para
  // manejar condiciones especiales de Layouts móviles y de escritorio
  useEffect(() => {
    function handleWindow() {
      if (window.innerWidth < 768 || window.innerHeight < 500) {
        if (!isMobile) {
          setIsToggled(false);
        }
        setIsMobile(true);
      } else {
        setIsMobile(false);
        setIsToggled(false);
      }
    }

    const handlePageClick = (e) => {
      const { target } = e;
      // Cerrar menu al presionar fuera de este o del botón toogle
      if (!menuButtonRef?.current?.contains(target)
      && !menuRef?.current?.contains(target)) {
        setIsToggled(false);
      }
    };

    handleWindow();
    globalThis.addEventListener('resize', handleWindow);
    globalThis.addEventListener('click', handlePageClick);

    return () => {
      globalThis.removeEventListener('resize', handleWindow);
      globalThis.removeEventListener('click', handlePageClick);
    };
  }, []);

  // Efecto para obtener la información del usuario, si esta devuelve algún "falsy"
  // no debe mostrarse ningún tipo de información
  useEffect(() => {
    if (token === undefined || token === null) setIsShown(false);
    else {
      setIsShown(true);
      setIsToggled(false);
      setPayload(getTokenPayload(token));
    }
  }, [token]);

  // Función de despliegue o retracción de sidebar
  const toggleMenu = () => {
    setIsToggled(!isToggled);
  };

  return (
    <>
      {isShown ? (
        <TopBar
          toggler={toggleMenu}
          name={`${payload.name} ${payload.lastname}`}
          showToggler={isMobile}
          idUser={payload.id}
          hasImage={payload.hasImage ?? false}
          menuButtonRef={menuButtonRef}
        />
      ) : (
        false
      )}
      <div className={`${styles.pageContainer}`}>
        <div className={`${styles.navMenu} ${isToggled ? undefined : styles.retractedMenu}`}>
          <NavMenu
            idUser={payload.id}
            name={`${payload.name} ${payload.lastname}`}
            toggler={toggleMenu}
            roles={payload.role}
            hasImage={payload.hasImage ?? false}
            menuRef={menuRef}
          />
        </div>
        <div className={styles.page}>{children}</div>
      </div>
    </>
  );
}

PageContainer.defaultProps = {
  children: <NotFoundPage />,
};

PageContainer.propTypes = {
  children: PropTypes.node,
};

export default PageContainer;
