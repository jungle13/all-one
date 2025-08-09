import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

// --- PASO 1: MAPA DE NOMBRES AMPLIADO ---
const breadcrumbNameMap = {
  'dashboard': 'Dashboard',
  'manage-raffles': 'Gestionar Rifas',
  'sales-management': 'Gestión de Tiquetes',
  'cart': 'Carrito',
  'raffle': 'Rifas', // Nombre para el segmento padre de un detalle
  'ticket': 'Tiquetes', // Nombre para el segmento padre de un detalle
};

const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).replace(/-/g, ' ');
};

// --- PASO 2: FUNCIÓN PARA DETECTAR IDs DINÁMICOS (UUID) ---
const isUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // No mostramos nada en la página principal del dashboard para evitar un breadcrumb solitario.
  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return null;
  }

  return (
    <nav aria-label="breadcrumb" className={styles.breadcrumbsContainer}>
      <ol className={styles.breadcrumbList}>
        <li className={styles.breadcrumbItem}>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          let name;
          // Lógica mejorada para manejar IDs dinámicos
          if (isUUID(value)) {
            const parentPath = pathnames[index - 1];
            if (parentPath === 'raffle') {
              name = 'Detalle de Rifa';
            } else if (parentPath === 'ticket') {
              name = 'Detalle de Tiquete';
            } else {
              name = 'Detalle'; // Fallback genérico
            }
          } else {
            name = breadcrumbNameMap[value] || capitalizeFirstLetter(value);
          }

          return (
            <li key={to} className={styles.breadcrumbItem}>
              <span className={styles.separator}>/</span>
              {last ? (
                <span className={styles.current}>{name}</span>
              ) : (
                <Link to={to}>{name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
