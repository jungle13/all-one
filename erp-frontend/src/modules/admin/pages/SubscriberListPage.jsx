// PATH: erp-frontend/src/modules/admin/pages/SubscriberListPage.jsx
import * as React from 'react';
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import PageHeader from '../../../core/components/ui/PageHeader';
import SubscriberTable from '../components/SubscriberTable';

// Datos de prueba
const seed = [
  { id: 1, name: 'Luis Pérez',  email: 'luis@acme.co',  plan: 'Pro',        status: 'Activo' },
  { id: 2, name: 'María Rojas', email: 'maria@acme.co', plan: 'Free',       status: 'Pendiente' },
  { id: 3, name: 'Carlos Díaz', email: 'carlos@acme.co',plan: 'Pro',        status: 'Suspendido' },
  { id: 4, name: 'Ana Torres',  email: 'ana@acme.co',   plan: 'Enterprise', status: 'Activo' },
];

export default function SubscriberListPage() {
  const [rows, setRows] = React.useState(seed); // siempre array
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ name: '', email: '', plan: 'Free', status: 'Pendiente' });

  const showCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', plan: 'Free', status: 'Pendiente' });
    setOpen(true);
  };

  const showEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name ?? '', email: row.email ?? '', plan: row.plan ?? 'Free', status: row.status ?? 'Pendiente' });
    setOpen(true);
  };

  const handleDelete = (row) => setRows((prev) => prev.filter((r) => r.id !== row.id));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert('Nombre y correo son obligatorios.');
      return;
    }
    if (editing) {
      setRows((prev) => prev.map((r) => (r.id === editing.id ? { ...editing, ...form } : r)));
    } else {
      const newId = Math.max(0, ...rows.map((r) => r.id)) + 1;
      setRows((prev) => [{ id: newId, ...form }, ...prev]);
    }
    setOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Suscriptores"
        subtitle="Gestión de suscriptores del ERP"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Suscriptores' }]}
        actions={<Button variant="contained" onClick={showCreate}>Nuevo</Button>}
      />

      <Paper sx={{ p: 2 }}>
        {/* rows SIEMPRE definido */}
        <SubscriberTable rows={rows} onAdd={showCreate} onEdit={showEdit} onDelete={handleDelete} />
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" component="form" onSubmit={handleSubmit}>
        <DialogTitle>{editing ? 'Editar suscriptor' : 'Nuevo suscriptor'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required autoFocus
            />
            <TextField
              label="Correo"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <TextField select label="Plan" value={form.plan} onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}>
              {['Free', 'Pro', 'Enterprise'].map((opt) => (<MenuItem key={opt} value={opt}>{opt}</MenuItem>))}
            </TextField>
            <TextField select label="Estado" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              {['Activo', 'Pendiente', 'Suspendido'].map((opt) => (<MenuItem key={opt} value={opt}>{opt}</MenuItem>))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="submit" variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

