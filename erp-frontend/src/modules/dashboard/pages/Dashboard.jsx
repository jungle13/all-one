// =============================================
// 5) src/modules/dashboard/pages/Dashboard.jsx
// =============================================
import * as React from 'react';
import { Container, Grid2 as Grid, Button, Stack, Paper } from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PageHeader from '../../../core/components/ui/PageHeader';
import KpiCard from '../../../core/components/ui/KpiCard';
import { DataGrid } from '@mui/x-data-grid';
import { LineChart } from '@mui/x-charts/LineChart';

const rows = [
  { id: 1, name: 'Luis Pérez', email: 'luis@acme.co', plan: 'Pro', status: 'Activo' },
  { id: 2, name: 'María Rojas', email: 'maria@acme.co', plan: 'Free', status: 'Pendiente' },
  { id: 3, name: 'Carlos Díaz', email: 'carlos@acme.co', plan: 'Pro', status: 'Suspendido' },
  { id: 4, name: 'Ana Torres',  email: 'ana@acme.co',   plan: 'Enterprise', status: 'Activo' },
];

const columns = [
  { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 160 },
  { field: 'email', headerName: 'Correo', flex: 1, minWidth: 200 },
  { field: 'plan', headerName: 'Plan', width: 140 },
  { field: 'status', headerName: 'Estado', width: 140 },
];

export default function Dashboard() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen de métricas y actividad reciente"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Dashboard' }]}
        actions={<Button variant="contained" startIcon={<InsightsIcon/>}>Nuevo reporte</Button>}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <KpiCard label="Ingresos" value="$84,2M" diff={12} icon={<MonetizationOnIcon/>} color="success" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <KpiCard label="Clientes" value="1.248" diff={4} icon={<PeopleAltIcon/>} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <KpiCard label="Órdenes" value="3.902" diff={-2} icon={<ReceiptLongIcon/>} color="secondary" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <KpiCard label="ARPU" value="$67.3" diff={1.3} icon={<InsightsIcon/>} color="info" />
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2, height: 360 }}>
            <LineChart
              xAxis={[{ data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'] }]}
              series={[{ data: [22, 28, 26, 32, 38, 36, 44], label: 'Ingresos' }]}
              grid={{ horizontal: true }}
              height={320}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2, height: 360 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              disableRowSelectionOnClick
              pageSizeOptions={[5]}
              initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
              sx={{ border: 'none', height: '100%' }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}