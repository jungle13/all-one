// PATH: erp-frontend/src/modules/raffles/pages/SalesManagementPage.jsx
import * as React from 'react';
import { Container, Paper } from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import PageHeader from '../../../core/components/ui/PageHeader';
import { mockSales, mockRaffles } from '../data/mock';
import { pesoCol } from '../utils/format';

function Toolbar() {
  return (
    <GridToolbarContainer sx={{ px: 1, py: 0.5 }}>
      <GridToolbarQuickFilter quickFilterParser={(v) => v.split(/\s+/).filter(Boolean)} />
    </GridToolbarContainer>
  );
}

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
      <Paper sx={{ p: 1 }}>
        <DataGrid
          rows={mockSales}
          columns={columns}
          getRowId={(row) => row.id}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={[10]}
          slots={{ toolbar: Toolbar }}
          sx={{ border: 'none' }}
        />
      </Paper>
    </Container>
  );
}
