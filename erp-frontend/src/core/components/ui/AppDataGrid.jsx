// PATH: erp-frontend/src/core/components/ui/AppDataGrid.jsx
import * as React from 'react';
import { Paper } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import './app-data-grid.css';

/**
 * AppDataGrid
 * Wrapper estándar para DataGrid con:
 * - Paper con padding consistente
 * - Toolbar integrada (opcional) con quick filter (opcional)
 * - Paginación por defecto (pageSize 10)
 * - Props abiertas para sobreescribir / extender
 */
export default function AppDataGrid({
  rows = [],
  columns = [],
  pageSize = 10,
  pageSizeOptions = [10],
  showToolbar = true,
  showQuickFilter = true,
  quickFilterDebounceMs = 300,
  paperProps,
  dataGridProps,
  ...rest // se pasan al DataGrid
}) {
  const slots = showToolbar ? { toolbar: GridToolbar } : undefined;
  const slotProps =
    showToolbar && showQuickFilter
      ? { toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: quickFilterDebounceMs } } }
      : undefined;

  return (
    <Paper className="app-data-grid__paper" {...paperProps}>
      <DataGrid
        className="app-data-grid"
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        autoHeight
        pageSizeOptions={pageSizeOptions}
        initialState={{ pagination: { paginationModel: { pageSize } } }}
        slots={slots}
        slotProps={slotProps}
        {...dataGridProps}
        {...rest}
      />
    </Paper>
  );
}