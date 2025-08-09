import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './SidebarMenu.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSignOutAlt, faTasks, faDollarSign, 
    faTachometerAlt, faHome, faBars, faTimes 
} from '@fortawesome/free-solid-svg-icons';

const SidebarMenu = ({ isMobile, isOpen, isCollapsed, onToggle }) => {
    const sidebarClass = `
        ${styles.sidebarContainer}
        ${isMobile && isOpen ? styles.open : ''}
        ${!isMobile && isCollapsed ? styles.collapsed : ''}
    `;

    return (
        <aside className={sidebarClass}>
            <div className={styles.sidebarHeader}>
                {(!isCollapsed || isMobile) && <span className={styles.menuText}>Menu</span>}
                <button onClick={onToggle} className={styles.toggleButton}>
                    <FontAwesomeIcon icon={isMobile ? (isOpen ? faTimes : faBars) : (isCollapsed ? faBars : faTimes)} />
                </button>
            </div>
            <div className={styles.separator}></div>

            <nav className={styles.sidebarNav}>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>
                    <FontAwesomeIcon icon={faTachometerAlt} className={styles.navLinkIcon} />
                    <span className={styles.navLinkText}>Dashboard</span>
                </NavLink>
                <NavLink to="/manage-raffles" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>
                    <FontAwesomeIcon icon={faTasks} className={styles.navLinkIcon} />
                    <span className={styles.navLinkText}>Gestionar Rifas</span>
                </NavLink>
                <NavLink to="/sales-management" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>
                    <FontAwesomeIcon icon={faDollarSign} className={styles.navLinkIcon} />
                    <span className={styles.navLinkText}>Gestionar Tiquetes</span>
                </NavLink>
            </nav>

            <div className={styles.sidebarFooter}>
                <button className={styles.logoutButton}>
                    <FontAwesomeIcon icon={faSignOutAlt} className={styles.logoutIcon} />
                    <span className={styles.navLinkText}>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default SidebarMenu;