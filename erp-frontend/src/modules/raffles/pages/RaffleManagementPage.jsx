// PATH: erp-frontend/src/modules/raffles/pages/RaffleManagementPage.jsx
import * as React from 'react';
import { Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@core/components/ui/PageHeader';
import AppDataGrid from '@core/components/ui/AppDataGrid';
import { mockRaffles } from '@modules/raffles/data/mock';
import { pesoCol, entero } from '@modules/raffles/utils/format';

const columns = [
  { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 220 },
  { field: 'status', headerName: 'Estado', width: 140 },
  { field: 'price', headerName: 'Precio', width: 140, type: 'number', valueFormatter: ({ value }) => pesoCol(value) },
  { field: 'ticketsSold', headerName: 'Vendidos', width: 120, type: 'number', valueFormatter: ({ value }) => entero(value) },
  { field: 'totalTickets', headerName: 'Total', width: 120, type: 'number', valueFormatter: ({ value }) => entero(value) },
  { field: 'startDate', headerName: 'Inicio', width: 120 },
  { field: 'endDate', headerName: 'Fin', width: 120 },
];

export default function RaffleManagementPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Gestión de Rifas"
        subtitle="Crea y administra rifas"
        breadcrumbs={[{ label: 'Rifas', href: '/raffles' }, { label: 'Gestión de Rifas' }]}
        actions={<Button variant="contained" onClick={() => navigate('/raffles/raffles/new')}>Nueva rifa</Button>}
      />
      <AppDataGrid
        rows={mockRaffles}
        columns={columns}
        dataGridProps={{ getRowId: (row) => row.id }}
      />
    </Container>
  );
}