import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faCartPlus, faUser, faSignOutAlt, faBars } from '@fortawesome/free-solid-svg-icons';

const Header = ({ hasReservedItems, onLogout, userName, onToggleSidebar }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const cartIconToShow = hasReservedItems ? faCartPlus : faShoppingCart;
    const cartIconClass = hasReservedItems ? `${styles.cartIcon} ${styles.cartIconActive}` : styles.cartIcon;

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerSectionLeft}>
                <button onClick={onToggleSidebar} className={styles.mobileMenuButton}>
                    <FontAwesomeIcon icon={faBars} />
                </button>
                <Link to="/dashboard" className={styles.logoLink}>
                    <img src="/images/logo-R-completo.webp" alt="Logo R" className={styles.headerLogo} />
                </Link>
            </div>

            <div className={styles.headerSectionRight}>
                <Link to="/cart" className={styles.cartIconContainer} title="Ver carrito">
                    <FontAwesomeIcon icon={cartIconToShow} className={cartIconClass} />
                </Link>
                <div className={styles.profileMenuContainer}>
                    <button onClick={toggleMenu} className={styles.profileIconButton} title="Perfil">
                        <div className={styles.profileIcon}>
                            <FontAwesomeIcon icon={faUser} />
                        </div>
                        <span className={styles.userName}>{userName || 'Usuario'}</span>
                    </button>
                    {isMenuOpen && (
                        <div className={styles.dropdownMenu}>
                            <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className={`${styles.dropdownMenuItem} ${styles.logoutOption}`}>
                                <FontAwesomeIcon icon={faSignOutAlt} className={styles.dropdownIcon} />
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
