// PATH: erp-frontend/src/modules/raffles/components/RafflesShell.jsx
import * as React from 'react';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded';
import ModuleShell from '../../../core/components/layout/ModuleShell';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';

const items = [
  { id: 'raffles-dashboard', label: 'Dashboard',           path: '/raffles',            icon: DashboardRoundedIcon, exact: true },
  { id: 'raffles-manage',    label: 'Gestión de Rifas',    path: '/raffles/raffles',    icon: EmojiEventsRoundedIcon },
  { id: 'raffles-tickets',   label: 'Gestión de Tiquetes', path: '/raffles/tickets',    icon: ConfirmationNumberRoundedIcon },
  // Si luego quieres exponer "Ventas" en el menú, agrega aquí:
  { id: 'raffles-sales',     label: 'Gestión de Ventas',   path: '/raffles/sales',      icon: MonetizationOnRoundedIcon },
];

export default function RafflesShell() {
  return <ModuleShell title="ELIANA ERP - RAFFLES COLOMBIA" items={items} />;
}


