// PATH: erp-frontend/src/core/navigation/menuConfig.js
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
};

/**
 * Menú del ADMIN (layout principal).
 * IMPORTANTE: `icon` DEBE ser un componente React (no un string).
 */
export const menuItems = [
  {
    id: 'subscribers',
    label: 'Suscriptores',
    path: '/subscribers',
    icon: PeopleAltRoundedIcon,           // ✅ componente
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  {
    id: 'modules',
    label: 'Módulos',
    path: '/modules',
    icon: ViewModuleRoundedIcon,          // ✅ componente
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: DashboardRoundedIcon,           // ✅ componente
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
  },
];

export function getMenuForRole(role = ROLES.USER) {
  return menuItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(role)
  );
}

// Alias de compatibilidad si en alguna parte se importa { menuConfig }
export const menuConfig = menuItems;

// Default export opcional
export default menuItems;


