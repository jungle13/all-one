// PATH: erp-frontend/src/modules/raffles/pages/TicketManagementPage.jsx
import * as React from 'react';
import { Container, Paper, Typography } from '@mui/material';
import PageHeader from '../../../core/components/ui/PageHeader';

export default function TicketManagementPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Gestión de Tiquetes"
        subtitle="Administra tiquetes del módulo de rifas"
        breadcrumbs={[{ label: 'Rifas', href: '/raffles' }, { label: 'Gestión de Tiquetes' }]}
      />
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Interfaz de gestión de tiquetes (placeholder sin datos).
        </Typography>
      </Paper>
    </Container>
  );
}
