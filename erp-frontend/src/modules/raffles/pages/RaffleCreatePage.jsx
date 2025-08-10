// PATH: erp-frontend/src/modules/raffles/pages/RaffleCreatePage.jsx
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import PageHeader from '@/core/components/ui/PageHeader';
import RaffleForm from '@/modules/raffles/components/forms/RaffleForm';

export default function RaffleCreatePage() {
  const navigate = useNavigate();

  const handleSubmit = (payload) => {
    // TODO conectar con backend; por ahora mock:
    console.log('[Nueva Rifa] listo para API:', payload);
    navigate('/raffles/raffles');
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <PageHeader
        title="Nueva Rifa"
        subtitle="Completa la información para crear una rifa"
        breadcrumbs={[
          { label: 'Rifas', href: '/raffles' },
          { label: 'Gestión de Rifas', href: '/raffles/raffles' },
          { label: 'Nueva' }
        ]}
      />
      <RaffleForm onSubmit={handleSubmit} onCancel={() => navigate('/raffles/raffles')} />
    </Container>
  );
}


