// PATH: erp-frontend/src/modules/raffles/pages/TicketDetailPage.jsx
import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Stack, Typography, Divider } from '@mui/material';
import PageHeader from '../../../core/components/ui/PageHeader';
import { mockTicketById, mockRaffles } from '../data/mock';

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const t = mockTicketById(ticketId);
  const raffleName = t ? (mockRaffles.find(r => r.id === t.raffleId)?.name ?? '—') : '—';

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <PageHeader
        title={`Tiquete #${t?.number ?? '—'}`}
        subtitle="Detalle del tiquete"
        breadcrumbs={[
          { label: 'Rifas', href: '/raffles' },
          { label: 'Gestión de Tiquetes', href: '/raffles/tickets' },
          { label: t?.number ?? 'Detalle' },
        ]}
      />
      <Paper sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Typography variant="body1"><strong>Rifa:</strong> {raffleName}</Typography>
          <Typography variant="body1"><strong>Comprador:</strong> {t?.buyer ?? '—'}</Typography>
          <Typography variant="body1"><strong>Teléfono:</strong> {t?.phone ?? '—'}</Typography>
          <Typography variant="body1"><strong>Estado:</strong> {t?.status ?? '—'}</Typography>
          <Typography variant="body1"><strong>Fecha compra:</strong> {t?.purchaseDate ?? '—'}</Typography>
          <Divider />
          <Typography variant="caption" color="text.secondary">Datos de prueba (sin backend)</Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
