// PATH: erp-frontend/src/modules/dashboard/pages/Dashboard.jsx
import * as React from 'react';
import { Box, Container, Paper, Button } from '@mui/material';
import Grid from '@mui/material/Grid'; // ✅ v7: Grid estable (no Grid2)
import InsightsIcon from '@mui/icons-material/Insights';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PageHeader from '../../../core/components/ui/PageHeader';
import KpiCard from '../../../core/components/ui/KpiCard';
import { DataGrid } from '@mui/x-data-grid';
import { LineChart } from '@mui/x-charts/LineChart';

// Medimos el ancho del contenedor para el LineChart (evita error de width)
function useContainerWidth() {
  const ref = React.useRef(null);
  const [width, setWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWidth(Math.floor(e.contentRect.width));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

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
  const [chartRef, chartWidth] = useContainerWidth();

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen de métricas y actividad reciente"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Dashboard' }]}
        actions={<Button variant="contained" startIcon={<InsightsIcon/>}>Nuevo reporte</Button>}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <KpiCard label="Ingresos" value="$84,2M" diff={12} icon={<MonetizationOnIcon/>} color="success" />
        </Grid>
        <Grid item xs={12} md={3}>
          <KpiCard label="Clientes" value="1.248" diff={4} icon={<PeopleAltIcon/>} />
        </Grid>
        <Grid item xs={12} md={3}>
          <KpiCard label="Órdenes" value="3.902" diff={-2} icon={<ReceiptLongIcon/>} color="secondary" />
        </Grid>
        <Grid item xs={12} md={3}>
          <KpiCard label="ARPU" value="$67.3" diff={1.3} icon={<InsightsIcon/>} color="info" />
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Box ref={chartRef} sx={{ width: '100%' }}>
              <LineChart
                width={chartWidth || 600}
                height={320}
                xAxis={[{ data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'] }]}
                series={[{ data: [22, 28, 26, 32, 38, 36, 44], label: 'Ingresos' }]}
                grid={{ horizontal: true }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
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

