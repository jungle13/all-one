// PATH: erp-frontend/src/modules/raffles/pages/RafflesDashboardPage.jsx
import * as React from 'react';
import { Container, Grid, Paper, Stack, Button } from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import PageHeader from '../../../core/components/ui/PageHeader';
import KpiCard from '../../../core/components/ui/KpiCard';
import { mockRaffles, mockTickets } from '../data/mock';

export default function RafflesDashboardPage() {
  const totalRaffles = mockRaffles.length;
  const activeRaffles = mockRaffles.filter(r => r.status === 'Activa').length;
  const totalTickets = mockRaffles.reduce((a, r) => a + r.totalTickets, 0);
  const soldTickets  = mockRaffles.reduce((a, r) => a + r.ticketsSold, 0);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Dashboard (Rifas)"
        subtitle="Resumen del módulo de rifas"
        breadcrumbs={[{ label: 'Rifas', href: '/raffles' }, { label: 'Dashboard' }]}
        actions={<Button variant="contained" startIcon={<InsightsIcon/>}>Nuevo reporte</Button>}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}><KpiCard label="Rifas totales" value={totalRaffles} diff={0.6} /></Grid>
        <Grid item xs={12} md={3}><KpiCard label="Rifas activas" value={activeRaffles} diff={1.2} color="success" /></Grid>
        <Grid item xs={12} md={3}><KpiCard label="Tiquetes" value={totalTickets} diff={0.2} color="info" /></Grid>
        <Grid item xs={12} md={3}><KpiCard label="Vendidos" value={soldTickets} diff={-0.3} color="secondary" /></Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            {/* Aquí podría ir un gráfico; evitamos issues de tamaño con placeholders por ahora */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <div>Actividad reciente (placeholder, sin datos todavía)</div>
              <div>Tiquetes registrados: {mockTickets.length}</div>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

