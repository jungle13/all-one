// PATH: erp-frontend/src/modules/admin/components/SubscriberTable.jsx
import * as React from 'react';
import { Box, Button, Stack } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridToolbarQuickFilter } from '@mui/x-data-grid';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

/**
 * Tabla de Suscriptores (única y robusta):
 * - Acepta `rows` (preferido) o `data` (compatibilidad).
 * - Si recibe indefinidos, usa [] y NO rompe.
 */
export default function SubscriberTable({ rows, data, onAdd, onEdit, onDelete }) {
  const safeRows = React.useMemo(() => {
    if (Array.isArray(rows)) return rows;
    if (Array.isArray(data)) return data;
    return [];
  }, [rows, data]);

  const columns = React.useMemo(() => [
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 180 },
    { field: 'email', headerName: 'Correo', flex: 1, minWidth: 220 },
    { field: 'plan', headerName: 'Plan', width: 140, valueGetter: (v, r) => r?.plan ?? '—' },
    { field: 'status', headerName: 'Estado', width: 140, valueGetter: (v, r) => r?.status ?? '—' },
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
  ], [onEdit, onDelete]);

  return (
    <Box sx={{ height: 520, width: '100%' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Button onClick={onAdd} variant="contained" startIcon={<AddRoundedIcon />}>
          Nuevo suscriptor
        </Button>
        <GridToolbarQuickFilter sx={{ '& input': { minWidth: 260 } }} />
      </Stack>

      <DataGrid
        rows={safeRows}
        getRowId={(r) => r.id ?? r._id ?? `${r.email}-${r.name}`} // fallback por si falta id
        columns={columns}
        disableRowSelectionOnClick
        density="comfortable"
        pageSizeOptions={[5, 10]}
        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
          },
          height: 468,
        }}
      />
    </Box>
  );
}


