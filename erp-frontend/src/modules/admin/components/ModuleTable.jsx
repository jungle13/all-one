// PATH: erp-frontend/src/modules/admin/components/ModuleTable.jsx
import * as React from 'react';
import { Chip, Stack, Tooltip, Switch, Button, IconButton } from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import { useNavigate } from 'react-router-dom';
import AppDataGrid from '@core/components/ui/AppDataGrid';

/**
 * Tabla reutilizable para Módulos.
 * - Tolera rows undefined (usa [] por defecto).
 * - Callbacks: Edit/Delete/Toggle.
 */
export default function ModuleTable({
  rows = [],
  onEdit,
  onDelete,
  onToggleEnabled,
}) {
  const navigate = useNavigate();

  const columns = React.useMemo(
    () => [
      { field: 'name', headerName: 'Módulo', flex: 1, minWidth: 220 },
      {
        field: 'key',
        headerName: 'Clave',
        width: 180,
        valueFormatter: (v) => v?.value ?? '—',
      },
      {
        field: 'enabled',
        headerName: 'Estado',
        width: 180,
        sortable: false,
        renderCell: (params) => {
          const enabled = Boolean(params.value);
          return (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Switch
                checked={enabled}
                onChange={() => onToggleEnabled?.(params.row)}
                inputProps={{ 'aria-label': 'Cambiar estado' }}
              />
              <Chip size="small" color={enabled ? 'success' : 'default'} label={enabled ? 'Activo' : 'Inactivo'} />
            </Stack>
          );
        },
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 220,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const isRaffles = params.row?.id === 'rifas' || params.row?.key === 'rifas';
          if (isRaffles) {
            return (
              <Button
                size="small"
                variant="contained"
                startIcon={<LoginRoundedIcon />}
                onClick={() => navigate('/raffles')}
              >
                Ingresar
              </Button>
            );
          }
          // Acciones estándar para el resto
          return (
            <Stack direction="row" spacing={1}>
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => onEdit?.(params.row)}>
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton size="small" onClick={() => onDelete?.(params.row)}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [navigate, onEdit, onDelete, onToggleEnabled]
  );

  return (
    <AppDataGrid 
      rows={rows}
      columns={columns}
      pageSize={10}
      pageSizeOptions={[5, 10, 25]}
      dataGridProps={{
        getRowId: (r) => r.id,
        sx: { height: 560 }
      }}
    />
  );
}