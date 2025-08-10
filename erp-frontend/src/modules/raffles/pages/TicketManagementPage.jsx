// PATH: erp-frontend/src/modules/raffles/pages/TicketManagementPage.jsx
import * as React from 'react';
import { Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@core/components/ui/PageHeader';
import AppDataGrid from '@core/components/ui/AppDataGrid';

const rows = [
  { id: 'T-001', raffleName: 'Rifa Aniversario', buyerName: 'Juan Pérez', phone: '3001234567', numbers: ['0123'], paymentType: 'efectivo', status: 'paid',    createdAt: '2025-08-05' },
  { id: 'T-002', raffleName: 'Rifa Día del Niño', buyerName: 'María López', phone: '3019876543', numbers: ['45','78'], paymentType: 'transferencia', status: 'pending', createdAt: '2025-08-07' },
];

const columns = [
  { field: 'id', headerName: 'ID', width: 110 },
  { field: 'raffleName', headerName: 'Rifa', flex: 1, minWidth: 180 },
  { field: 'buyerName', headerName: 'Comprador', flex: 1, minWidth: 180 },
  { field: 'phone', headerName: 'Celular', width: 140 },
  { field: 'numbers', headerName: 'Números', flex: 1, minWidth: 160, valueFormatter: ({ value }) => Array.isArray(value) ? value.join(', ') : value ?? '—' },
  { field: 'paymentType', headerName: 'Pago', width: 140 },
  { field: 'status', headerName: 'Estado', width: 120 },
  { field: 'createdAt', headerName: 'Creado', width: 130 },
];

export default function TicketManagementPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Gestión de tiquetes"
        subtitle="Consulta y administra los tiquetes registrados"
        breadcrumbs={[{ label: 'Rifas', href: '/raffles' }, { label: 'Gestión de Tiquetes' }]}
        actions={<Button variant="contained" onClick={() => navigate('/raffles/tickets/new')}>Nuevo tiquete</Button>}
      />

      <AppDataGrid rows={rows} columns={columns} />
    </Container>
  );
}