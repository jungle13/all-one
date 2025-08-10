// PATH: erp-frontend/src/modules/raffles/pages/RaffleManagementPage.jsx
import * as React from 'react';
import { Container, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageHeader from '../../../core/components/ui/PageHeader';
import { mockRaffles } from '../data/mock';
import { pesoCol, entero } from '../utils/format';

export default function RaffleManagementPage() {
  const columns = [
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 220 },
    { field: 'status', headerName: 'Estado', width: 140 },
    { field: 'price', headerName: 'Precio', width: 140, type: 'number',
      valueFormatter: ({ value }) => pesoCol(value) },
    { field: 'ticketsSold', headerName: 'Vendidos', width: 120, type: 'number',
      valueFormatter: ({ value }) => entero(value) },
    { field: 'totalTickets', headerName: 'Total', width: 120, type: 'number',
      valueFormatter: ({ value }) => entero(value) },
    { field: 'startDate', headerName: 'Inicio', width: 120 },
    { field: 'endDate', headerName: 'Fin', width: 120 },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Gestión de Rifas"
        subtitle="Crea y administra rifas"
        breadcrumbs={[{ label: 'Rifas', href: '/raffles' }, { label: 'Gestión de Rifas' }]}
      />
      <Paper sx={{ p: 1 }}>
        <DataGrid
          rows={mockRaffles}
          columns={columns}
          getRowId={(r) => r.id}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={[10]}
          sx={{ border: 'none' }}
        />
      </Paper>
    </Container>
  );
}


