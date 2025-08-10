// PATH: erp-frontend/src/modules/raffles/components/RafflesShell.jsx
import * as React from 'react';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded';
import ModuleShell from '../../../core/components/layout/ModuleShell';

const items = [
  { id: 'raffles-dashboard', label: 'Dashboard', path: '/raffles', icon: DashboardRoundedIcon, exact: true },
  { id: 'raffles-manage',    label: 'Gestión de Rifas', path: '/raffles/raffles', icon: EmojiEventsRoundedIcon },
  { id: 'raffles-tickets',   label: 'Gestión de Tiquetes', path: '/raffles/tickets', icon: ConfirmationNumberRoundedIcon },
];

/**
 * Wrapper específico del módulo de Rifas que SOLAMENTE
 * define título y opciones de menú. Header/Sidebar/Colapso
 * se heredan de ModuleShell (no se re-implementan).
 */
export default function RafflesShell() {
  return <ModuleShell title="ELIANA ERP - RAFFLES COLOMBIA" items={items} />;
}

