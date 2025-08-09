// PATH: erp-frontend/src/modules/admin/pages/SubscriberListPage.jsx
import * as React from 'react';
import { Container, Button } from '@mui/material';
import PageHeader from '../../../core/components/ui/PageHeader';
import SubscriberTable from '../components/SubscriberTable';

const seedRows = [
  { id: 1, name: 'Empresa ABC', email: 'contacto@abc.com', plan: 'Pro', status: 'Activa' },
  { id: 2, name: 'Juan Pérez',  email: 'juan@correo.com',   plan: 'Free', status: 'Pendiente' },
  { id: 3, name: 'María Rojas', email: 'maria@dominio.co',  plan: 'Pro',  status: 'Suspendida' },
];

export default function SubscriberListPage() {
  const [rows, setRows] = React.useState(seedRows);

  const handleAdd = () => {
    // TODO: abrir modal/form real
    const nextId = Math.max(0, ...rows.map(r => r.id)) + 1;
    setRows((prev) => [
      ...prev,
      { id: nextId, name: 'Nuevo suscriptor', email: 'nuevo@demo.com', plan: 'Free', status: 'Activa' },
    ]);
  };

  const handleEdit = (row) => {
    // TODO: abrir modal/form edición
    console.log('Editar', row);
  };

  const handleDelete = (row) => {
    setRows((prev) => prev.filter((r) => r.id !== row.id));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Suscriptores"
        subtitle="Administra los suscriptores del ERP"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Suscriptores' }]}
        
      />

      <SubscriberTable
        rows={rows}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Container>
  );
}


