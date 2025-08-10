// PATH: erp-frontend/src/modules/raffles/pages/SalesManagementPage.jsx
import * as React from 'react';
import { Container } from '@mui/material';
import PageHeader from '../../../core/components/ui/PageHeader';
import { mockSales, mockRaffles } from '../data/mock';
import { pesoCol } from '../utils/format';
import AppDataGrid from '@core/components/ui/AppDataGrid';

const raffleName = (id) => mockRaffles.find(r => r.id === id)?.name ?? '—';

export default function SalesManagementPage() {
  const columns = [
    { field: 'date', headerName: 'Fecha', width: 120 },
    { field: 'raffleId', headerName: 'Rifa', flex: 1, minWidth: 220, valueGetter: ({ value }) => raffleName(value) },
    { field: 'method', headerName: 'Método', width: 140 },
    { field: 'amount', headerName: 'Monto', width: 120, type: 'number',
        valueFormatter: ({ value }) => pesoCol(value) },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Gestión de Ventas"
        subtitle="Registros de ventas (mock)"
        breadcrumbs={[{ label: 'Rifas', href: '/raffles' }, { label: 'Gestión de Ventas' }]}
      />
      <AppDataGrid
        rows={mockSales}
        columns={columns}
        dataGridProps={{ getRowId: (row) => row.id }}
      />
    </Container>
  );
}