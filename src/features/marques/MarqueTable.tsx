// src/features/marques/MarqueTable.tsx

import React from 'react';
import { Alert, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';

import type { Marque } from '../../api/endpoints/marque.api';
import type { PaginationState } from './marqueTypes';

interface MarqueTableProps {
  rows: Marque[];
  columns: GridColDef<Marque>[];
  loading: boolean;
  pagination: PaginationState;
  onPaginationChange: (model: GridPaginationModel) => void;
  error: string | null;
  onClearError: () => void;
}

export const MarqueTable: React.FC<MarqueTableProps> = ({
  rows,
  columns,
  loading,
  pagination,
  onPaginationChange,
  error,
  onClearError,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        p: { xs: 2.5, md: 3 },
        border: '1px solid',
        borderColor: alpha('#1e293b', 0.05),
        boxShadow: '0 22px 48px rgba(15, 23, 42, 0.12)',
        backdropFilter: 'blur(6px)',
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={onClearError}>
          {error}
        </Alert>
      )}

      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        paginationMode="server"
        paginationModel={{
          page: Math.max(pagination.page - 1, 0),
          pageSize: pagination.pageSize,
        }}
        rowCount={pagination.totalRecords}
        onPaginationModelChange={onPaginationChange}
        pageSizeOptions={[10, 25, 50, 100]}
        disableColumnMenu
        disableColumnFilter
        disableColumnSelector
        density="comfortable"
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnSeparator': {
            display: 'none',
          },
          '& .MuiDataGrid-row': {
            borderRadius: 3,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 18px 30px rgba(15, 23, 42, 0.14)',
              backgroundColor: alpha('#2563eb', 0.06),
            },
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid',
            borderColor: alpha('#1e293b', 0.05),
            paddingTop: '14px',
            paddingBottom: '14px',
          },
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: '1px solid',
            borderColor: alpha('#1e293b', 0.1),
            background: alpha('#1d4ed8', 0.1),
          },
        }}
      />
    </Paper>
  );
};
