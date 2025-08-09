// PATH: erp-frontend/src/modules/admin/components/ModuleTable.jsx
import * as React from 'react';
import { Box, Chip, Stack, Tooltip, Switch, Button } from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

/** Toolbar dentro del contexto del DataGrid */
function ModulesToolbar({ onAdd }) {
  return (
    <GridToolbarContainer sx={{ px: 1, py: 0.5, display: 'flex', gap: 1, justifyContent: 'space-between' }}>
      <GridToolbarQuickFilter
        quickFilterParser={(v) => v.split(/\s+/).filter(Boolean)}
      />
      <Tooltip title="Nuevo módulo">
        <span>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => onAdd?.()}>
            Nuevo módulo
          </Button>
        </span>
      </Tooltip>
    </GridToolbarContainer>
  );
}

/**
 * Tabla reutilizable para Módulos.
 * - Tolera rows undefined (usa [] por defecto).
 * - Callbacks: Add/Edit/Delete/Toggle.
 */
export default function ModuleTable({
  rows = [],
  onAdd,
  onEdit,
  onDelete,
  onToggleEnabled,
}) {
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
              <Chip
                size="small"
                color={enabled ? 'success' : 'default'}
                label={enabled ? 'Activo' : 'Inactivo'}
              />
            </Stack>
          );
        },
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'Acciones',
        width: 120,
        getActions: (params) => [
          <GridActionsCellItem
            key="edit"
            icon={<EditRoundedIcon />}
            label="Editar"
            onClick={() => onEdit?.(params.row)}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteOutlineRoundedIcon />}
            label="Eliminar"
            onClick={() => onDelete?.(params.row)}
          />,
        ],
      },
    ],
    [onEdit, onDelete, onToggleEnabled]
  );

  return (
    <Box sx={{ height: 560, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        slots={{ toolbar: ModulesToolbar }}
        slotProps={{ toolbar: { onAdd } }}
        sx={{ border: 'none', height: '100%' }}
      />
    </Box>
  );
}
