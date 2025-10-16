// src/components/common/DataTable.tsx
import React from 'react';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
  GridRowIdGetter,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { Paper, Box } from '@mui/material';
import type { PaginationMeta } from '../../types/api.types';

interface DataTableProps<T extends GridValidRowModel> {
  rows: T[];
  columns: GridColDef[];
  pagination: PaginationMeta;
  loading?: boolean;
  onPaginationChange: (model: GridPaginationModel) => void;
  onSortChange?: (model: GridSortModel) => void;
  checkboxSelection?: boolean;
  onSelectionChange?: (ids: number[]) => void;
  getRowId?: GridRowIdGetter<T>; // Support custom row ID
}

export function DataTable<T extends Record<string, any>>({
  rows,
  columns,
  pagination,
  loading = false,
  onPaginationChange,
  onSortChange,
  checkboxSelection = false,
  onSelectionChange,
  getRowId,
}: DataTableProps<T>) {
  return (
    <Paper className="w-full">
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={getRowId} // Pass custom getRowId
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
            '& .MuiDataGrid-cell.action-cell': {
              justifyContent: 'center',
              alignItems: 'center',
            },
            '& .MuiDataGrid-cell.action-cell > *': {
              margin: '0 auto',
            },
            '& .MuiDataGrid-cell.text-center-cell': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            },
          }}
        />
      </Box>
    </Paper>
  );
}
