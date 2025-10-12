// src/components/common/DataTable.tsx
import React from 'react';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { Paper, Box } from '@mui/material';
import type { PaginationMeta } from '../../types/api.types';

interface DataTableProps<T> {
  rows: T[];
  columns: GridColDef[];
  pagination: PaginationMeta;
  loading?: boolean;
  onPaginationChange: (model: GridPaginationModel) => void;
  onSortChange?: (model: GridSortModel) => void;
  checkboxSelection?: boolean;
  onSelectionChange?: (ids: number[]) => void;
}

export function DataTable<T extends { id: number }>({
  rows,
  columns,
  pagination,
  loading = false,
  onPaginationChange,
  onSortChange,
  checkboxSelection = false,
  onSelectionChange,
}: DataTableProps<T>) {
  return (
    <Paper className="w-full">
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pagination
          paginationMode="server"
          paginationModel={{
            page: pagination.page - 1,
            pageSize: pagination.pageSize,
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          rowCount={pagination.totalRecords}
          onPaginationModelChange={(model) => {
            onPaginationChange({
              page: model.page + 1,
              pageSize: model.pageSize,
            });
          }}
          sortingMode={onSortChange ? 'server' : 'client'}
          onSortModelChange={onSortChange}
          checkboxSelection={checkboxSelection}
          onRowSelectionModelChange={(ids) => {
            if (onSelectionChange) {
              onSelectionChange(ids as number[]);
            }
          }}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        />
      </Box>
    </Paper>
  );
}
