import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  VIEWER: 'viewer',
};

/**
 * Menú centralizado con íconos y permisos.
 * - El PRIMER ítem es "Subscriptores", como pediste.
 * - Usa `allowedRoles` para controlar visibilidad.
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