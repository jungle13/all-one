// PATH: erp-frontend/src/modules/raffles/pages/RaffleDetailPage.jsx
import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Stack, Typography } from '@mui/material';
import PageHeader from '../../../core/components/ui/PageHeader';
import KpiCard from '../../../core/components/ui/KpiCard';
import { mockRaffleById, mockTickets } from '../data/mock';
import AppDataGrid from '@core/components/ui/AppDataGrid';

export default function RaffleDetailPage() {
  const { raffleId } = useParams();
  const raffle = mockRaffleById(raffleId);
  const tickets = mockTickets.filter(t => t.raffleId === raffleId);

  const columns = [
    { field: 'number', headerName: 'N°', width: 100 },
    { field: 'buyer', headerName: 'Comprador', flex: 1, minWidth: 180 },
    { field: 'phone', headerName: 'Teléfono', width: 140 },
    { field: 'status', headerName: 'Estado', width: 140 },
    { field: 'purchaseDate', headerName: 'Fecha', width: 120 },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title={`Detalle de Rifa: ${raffle?.name ?? '—'}`}
        subtitle="Estado y tiquetes asociados"
        breadcrumbs={[
          { label: 'Rifas', href: '/raffles' },
          { label: 'Gestión de Rifas', href: '/raffles/raffles' },
          { label: raffle?.name ?? 'Detalle' },
        ]}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}><KpiCard label="Estado" value={raffle?.status ?? '—'} /></Grid>
        <Grid item xs={12} md={3}><KpiCard label="Precio" value={`$${(raffle?.price ?? 0).toLocaleString()}`} color="info" /></Grid>
        <Grid item xs={12} md={3}><KpiCard label="Vendidos" value={raffle?.ticketsSold ?? 0} color="success" /></Grid>
        <Grid item xs={12} md={3}><KpiCard label="Total" value={raffle?.totalTickets ?? 0} color="secondary" /></Grid>

        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Tiquetes</Typography>
            <Typography variant="body2" color="text.secondary">Mostrando {tickets.length} tiquetes (mock)</Typography>
          </Stack>
          <AppDataGrid
            rows={tickets}
            columns={columns}
          />
        </Grid>
      </Grid>
    </Container>
  );
}