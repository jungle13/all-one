// PATH: erp-frontend/src/modules/admin/components/SubscriberTable.jsx
import * as React from 'react';
import { Box, Button } from '@mui/material';
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
function SubscribersToolbar({ onAdd }) {
  return (
    <GridToolbarContainer sx={{ px: 1, py: 0.5, display: 'flex', gap: 1, justifyContent: 'space-between' }}>
      <GridToolbarQuickFilter
        quickFilterParser={(v) => v.split(/\s+/).filter(Boolean)}
      />
      <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => onAdd?.()}>
        Nuevo suscriptor
      </Button>
    </GridToolbarContainer>
  );
}

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
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={safeRows}
        getRowId={(r) => r.id ?? r._id ?? `${r.email}-${r.name}`}
        columns={columns}
        disableRowSelectionOnClick
        density="comfortable"
        pageSizeOptions={[5, 10]}
        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
        slots={{ toolbar: SubscribersToolbar }}
        slotProps={{ toolbar: { onAdd } }}
        sx={{ border: 'none', height: 520 }}
      />
    </Box>
  );
}


