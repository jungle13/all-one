// PATH: erp-frontend/src/modules/raffles/pages/RaffleManagementPage.jsx
import * as React from 'react';
import { Container, Paper, Typography } from '@mui/material';
import PageHeader from '../../../core/components/ui/PageHeader';

export default function RaffleManagementPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Gestión de Rifas"
        subtitle="Crea y administra rifas"
        breadcrumbs={[{ label: 'Rifas', href: '/raffles' }, { label: 'Gestión de Rifas' }]}
      />
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Interfaz de gestión de rifas (placeholder sin datos).
        </Typography>
      </Paper>
    </Container>
  );
}
