// PATH: erp-frontend/src/core/components/layout/MainLayout.jsx
import * as React from 'react';
import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMenuForRole } from '../../navigation/menuConfig';
import ModuleShell from './ModuleShell';

/**
 * Layout por defecto del admin.
 * - Provee header y sidebar colapsable.
 * - Los módulos que hereden solo cambian el título y el contenido del sidebar.
 */
export default function MainLayout() {
  const { user } = useAuth();
  const menuItems = useMemo(() => getMenuForRole(user?.role), [user?.role]);

  return (
    <ModuleShell title="ELIANA ERP - ADMIN" items={menuItems} />
  );
}



