// PATH: erp-frontend/src/core/navigation/menuConfig.js
// Menú lateral basado en roles. Añadimos "Módulos".

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
};

export const menuItems = [
  {
    id: 'subscribers',
    label: 'Subscribers',
    icon: 'PeopleAltRounded',
    path: '/subscribers',
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  {
    id: 'modules',
    label: 'Módulos',
    icon: 'ViewModuleRounded',
    path: '/modules',
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'DashboardRounded',
    path: '/dashboard',
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
  },
];

// Helper para filtrar por rol
export function getMenuForRole(role = ROLES.USER) {
  return menuItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(role)
  );
}

// Export alias para mantener compatibilidad con importaciones existentes
export const menuConfig = menuItems;

export default menuItems;

