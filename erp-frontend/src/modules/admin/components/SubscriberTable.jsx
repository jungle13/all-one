// PATH: erp-frontend/src/modules/admin/components/SubscriberTable.jsx
import * as React from 'react';
import { Paper, Stack, Typography, Button } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { GridActionsCellItem } from '@mui/x-data-grid';

export default function SubscriberTable({ rows, data, onAdd, onEdit, onDelete }) {
  // Tolera props ausentes: usa [] por defecto
  const items = React.useMemo(
    () => (Array.isArray(rows) ? rows : Array.isArray(data) ? data : []),
    [rows, data]
  );

  const columns = React.useMemo(
    () => [
      { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 180 },
      { field: 'email', headerName: 'Correo', flex: 1, minWidth: 220 },
      { field: 'plan', headerName: 'Plan', width: 140 },
      { field: 'status', headerName: 'Estado', width: 140 },
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
            showInMenu
          />,
        ],
      },
    ],
    [onEdit, onDelete]
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6">Suscriptores</Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => onAdd?.()}
        >
          Nuevo
        </Button>
      </Stack>

      <div style={{ width: '100%' }}>
        <DataGrid
          rows={items}
          columns={columns}
          disableRowSelectionOnClick
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          sx={{ border: 'none' }}
        />
      </div>
    </Paper>
  );
}

