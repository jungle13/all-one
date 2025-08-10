// PATH: erp-frontend/src/modules/raffles/pages/RafflesDashboardPage.jsx
import * as React from 'react';
import { Container, Paper, Typography } from '@mui/material';
import PageHeader from '../../../core/components/ui/PageHeader';

export default function RafflesDashboardPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Dashboard (Rifas)"
        subtitle="Resumen del módulo de rifas"
        breadcrumbs={[{ label: 'Rifas', href: '/raffles' }, { label: 'Dashboard' }]}
      />
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Aquí irá el dashboard del módulo de rifas (sin datos por ahora).
        </Typography>
      </Paper>
    </Container>
  );
}
