// src/features/sites/SiteTable.tsx

import React from 'react';
import { Alert, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import type { Filiale } from '../../api/endpoints/filiale.api';
import type { Succursale } from '../../api/endpoints/succursale.api';
import type { PaginationState } from './siteTypes';

interface SiteTableProps {
  rows: (Filiale | Succursale)[];
  columns: GridColDef[];
  loading: boolean;
  pagination: PaginationState;
  onPaginationChange: (model: GridPaginationModel) => void;
  error: string | null;
  onClearError: () => void;
}

export const SiteTable: React.FC<SiteTableProps> = ({
  rows,
  columns,
  loading,
  pagination,
  onPaginationChange,
  error,
  onClearError,
}) => {
  return (
    <>
      {error && (
        <Alert severity="error" onClose={onClearError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Paper elevation={0} sx={{ height: 650, width: '100%', borderRadius: 3 }}>
        <DataGrid
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
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
            },
          }}
        />
      </Paper>
    </>
  );
};
