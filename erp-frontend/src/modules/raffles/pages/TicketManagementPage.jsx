// PATH: erp-frontend/src/modules/raffles/pages/TicketManagementPage.jsx
import * as React from 'react';
import { Container, Paper } from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter, GridActionsCellItem } from '@mui/x-data-grid';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PageHeader from '../../../core/components/ui/PageHeader';
import { useNavigate } from 'react-router-dom';
import { mockTickets, mockRaffles } from '../data/mock';

function Toolbar() {
  return (
    <GridToolbarContainer sx={{ px: 1, py: 0.5 }}>
      <GridToolbarQuickFilter quickFilterParser={(v) => v.split(/\s+/).filter(Boolean)} />
    </GridToolbarContainer>
  );
}

const raffleName = (id) => mockRaffles.find(r => r.id === id)?.name ?? '—';

export default function TicketManagementPage() {
  const navigate = useNavigate();
  const columns = [
    { field: 'number', headerName: 'N°', width: 100 },
    { field: 'raffleId', headerName: 'Rifa', flex: 1, minWidth: 200, valueGetter: ({ value }) => raffleName(value) },
    { field: 'buyer', headerName: 'Comprador', flex: 1, minWidth: 180 },
    { field: 'phone', headerName: 'Teléfono', width: 140 },
    { field: 'status', headerName: 'Estado', width: 140 },
    { field: 'purchaseDate', headerName: 'Fecha', width: 120 },
    {
      field: 'actions', type: 'actions', headerName: 'Acciones', width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityRoundedIcon />}
          label="Ver"
          onClick={() => navigate(`/raffles/tickets/${params.id}`)}
        />,
      ],
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Gestión de Tiquetes"
        subtitle="Administra tiquetes del módulo de rifas"
        breadcrumbs={[{ label: 'Rifas', href: '/raffles' }, { label: 'Gestión de Tiquetes' }]}
      />
      <Paper sx={{ p: 1 }}>
        <DataGrid
          rows={mockTickets}
          columns={columns}
          disableRowSelectionOnClick
          autoHeight
          pageSizeOptions={[10]}
          slots={{ toolbar: Toolbar }}
          sx={{ border: 'none' }}
        />
      </Paper>
    </Container>
  );
}

