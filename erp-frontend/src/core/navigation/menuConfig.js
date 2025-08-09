// PATH: erp-frontend/src/core/navigation/menuConfig.js
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  VIEWER: 'viewer',
};

/**
 * Menú centralizado con íconos y permisos.
 * - El PRIMER ítem es "Subscriptores".
 * - Usa `allowedRoles` para visibilidad por rol.
 */
export const menuItems = [
  {
    id: 'subscribers',
    label: 'Subscriptores',
    path: '/subscribers',
    icon: PeopleAltRoundedIcon,
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: DashboardRoundedIcon,
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.VIEWER],
  },
];

export function getMenuForRole(role) {
  return menuItems.filter((item) => !item.allowedRoles || item.allowedRoles.includes(role));
}

// Compatibilidad: si en algún archivo se importó { menuConfig }
export const menuConfig = menuItems;

// (Opcional) default export si alguien usa `import menu from ...`
export default menuItems;
