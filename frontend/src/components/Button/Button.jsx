import React from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.css';

function Button({
  text,
  onClick,
  type,
  className,
  disabled = false,
  red,
  emptyRed,
  green,
  emptyBlue,
  children,
  buttonRef,
  title,
}) {
  return (
    <button
      title={title}
      className={`${styles.button} 
      ${emptyRed ? styles.emptyRed : ''}
      ${red ? styles.red : ''}
      ${green ? styles.green : ''}
      ${emptyBlue ? styles.emptyBlue : ''}
      ${className}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
      ref={buttonRef}
    >
      {children || text}
    </button>
  );
}

Button.propTypes = {
  text: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  red: PropTypes.bool,
  emptyRed: PropTypes.bool,
  green: PropTypes.bool,
  emptyBlue: PropTypes.bool,
  children: PropTypes.node,
  title: PropTypes.string,
};

Button.defaultProps = {
  text: '',
  className: '',
  onClick: null,
  red: false,
  emptyRed: false,
  green: false,
  emptyBlue: false,
  type: 'button',
  disabled: false,
  children: null,
  title: null,
};
export default Button;
