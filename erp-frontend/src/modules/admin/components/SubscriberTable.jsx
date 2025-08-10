// PATH: erp-frontend/src/modules/admin/components/SubscriberTable.jsx
import * as React from 'react';
import {
  GridActionsCellItem,
} from '@mui/x-data-grid';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AppDataGrid from '@core/components/ui/AppDataGrid';


export default function SubscriberTable({ rows, data, onEdit, onDelete }) {
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
    <AppDataGrid
      rows={safeRows}
      columns={columns}
      pageSize={5}
      pageSizeOptions={[5, 10]}
      dataGridProps={{
        getRowId: (r) => r.id ?? r._id ?? `${r.email}-${r.name}`,
        density: 'comfortable',
        sx: { height: 520 },
      }}
    />
  );
}