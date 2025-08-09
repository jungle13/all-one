// PATH: erp-frontend/src/modules/admin/pages/ModuleListPage.jsx
import * as React from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import PageHeader from '../../../core/components/ui/PageHeader';
import ModuleTable from '../components/ModuleTable';

// Datos iniciales (mock) según tu lista
const INITIAL_MODULES = [
  { id: 'cartera', name: 'Gestión de Cartera', key: 'cartera', enabled: true },
  { id: 'inventario', name: 'Gestión de Inventario', key: 'inventario', enabled: true },
  { id: 'facturacion', name: 'Facturación', key: 'facturacion', enabled: true },
  { id: 'pos', name: 'Sistema POS', key: 'pos', enabled: false },
  { id: 'crm', name: 'CRM (Gestión de clientes)', key: 'crm', enabled: true },
  { id: 'proveedores', name: 'Gestión de Proveedores', key: 'proveedores', enabled: false },
  { id: 'compras', name: 'Gestión de Compras', key: 'compras', enabled: false },
  { id: 'documental', name: 'Gestión Documental', key: 'documental', enabled: false },
  { id: 'citas', name: 'Gestión de Citas', key: 'citas', enabled: false },
  { id: 'proyectos', name: 'Gestión de Proyectos', key: 'proyectos', enabled: false },
  { id: 'informes', name: 'Gestión de Informes', key: 'informes', enabled: true },
  { id: 'contabilidad', name: 'Contabilidad', key: 'contabilidad', enabled: false },
  { id: 'rifas', name: 'Gestión de Rifas', key: 'rifas', enabled: true },
];

export default function ModuleListPage() {
  const [rows, setRows] = React.useState(INITIAL_MODULES);

  // Estado del diálogo de crear/editar
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ name: '', key: '' });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', key: '' });
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name ?? '', key: row.key ?? '' });
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const handleSave = () => {
    const name = form.name.trim();
    const key = form.key.trim();
    if (!name || !key) return;

    if (editing) {
      setRows((prev) =>
        prev.map((r) => (r.id === editing.id ? { ...r, name, key } : r))
      );
    } else {
      const id = key.toLowerCase().replace(/\s+/g, '-');
      // Evitar IDs duplicados
      if (rows.some((r) => r.id === id)) {
        alert('Ya existe un módulo con esa clave.');
        return;
      }
      setRows((prev) => [{ id, name, key, enabled: true }, ...prev]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (row) => {
    if (confirm(`¿Eliminar el módulo "${row.name}"?`)) {
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    }
  };

  const handleToggleEnabled = (row) => {
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Módulos"
        subtitle="Activa/inhabilita módulos del ERP y administra su catálogo"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Módulos' }]}
        
      />

      <Paper sx={{ p: 2 }}>
        <ModuleTable
          rows={rows}
          onAdd={openCreate}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggleEnabled={handleToggleEnabled}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Editar módulo' : 'Nuevo módulo'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre del módulo"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              autoFocus
              required
              fullWidth
            />
            <TextField
              label="Clave (única)"
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              helperText="Se usará como identificador interno. Ej: 'inventario'"
              required
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}