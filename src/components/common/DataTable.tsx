// src/components/common/DataTable.tsx
import React from 'react';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
  GridRowIdGetter,
  GridValidRowModel,
  GridRowSelectionModel,
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

const DATA_GRID_SX = {
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
} as const;

const DEFAULT_PAGE_SIZE_OPTIONS = Object.freeze([10, 25, 50, 100]);

function DataTableComponent<T extends Record<string, any>>({
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
  const paginationModel = React.useMemo<GridPaginationModel>(
    () => ({
      page: Math.max(pagination.page - 1, 0),
      pageSize: pagination.pageSize,
    }),
    [pagination.page, pagination.pageSize]
  );

  const handlePaginationModelChange = React.useCallback(
    (model: GridPaginationModel) => {
      if (!onPaginationChange) {
        return;
      }

      if (model.page + 1 === pagination.page && model.pageSize === pagination.pageSize) {
        return;
      }

      onPaginationChange({
        page: model.page + 1,
        pageSize: model.pageSize,
      });
    },
    [onPaginationChange, pagination.page, pagination.pageSize]
  );

  const handleSelectionChange = React.useCallback(
    (ids: GridRowSelectionModel) => {
      if (!onSelectionChange) {
        return;
      }
      onSelectionChange(ids as number[]);
    },
    [onSelectionChange]
  );

  return (
    <Paper className="w-full">
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={getRowId}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
          rowCount={pagination.totalRecords}
          onPaginationModelChange={handlePaginationModelChange}
          sortingMode={onSortChange ? 'server' : 'client'}
          onSortModelChange={onSortChange}
          checkboxSelection={checkboxSelection}
          onRowSelectionModelChange={handleSelectionChange}
          disableRowSelectionOnClick
          columnHeaderHeight={48}
          rowHeight={48}
          density="comfortable"
          disableColumnMenu
          disableColumnFilter
          disableColumnSelector
          sx={DATA_GRID_SX}
        />
      </Box>
    </Paper>
  );
}

export const DataTable = React.memo(DataTableComponent) as typeof DataTableComponent;
