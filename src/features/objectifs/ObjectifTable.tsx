// src/features/objectifs/ObjectifTable.tsx

import React from 'react';
import { Alert, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import type { ObjectifView } from '../../api/endpoints/objectif.api';
import type { PaginationState } from './objectifTypes';

interface ObjectifTableProps {
  rows: ObjectifView[];
  columns: GridColDef[];
  loading: boolean;
  pagination: PaginationState;
  onPaginationChange: (model: GridPaginationModel) => void;
  error: string | null;
  onClearError: () => void;
}

export const ObjectifTable: React.FC<ObjectifTableProps> = ({
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
      <Paper
        elevation={0}
        sx={{
          height: 650,
          width: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95), rgba(226, 232, 240, 0.75))',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.12)',
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          paginationMode="client"
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
          rowHeight={60}
          columnHeaderHeight={56}
          sx={{
            border: 'none',
            fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            '& .MuiDataGrid-columnSeparator': {
              display: 'none',
            },
            '& .MuiDataGrid-row': {
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
              paddingTop: '12px',
              paddingBottom: '12px',
              lineHeight: 1.4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
            '& .MuiDataGrid-columnHeaders': {
              borderBottom: '1px solid',
              borderColor: alpha('#1e293b', 0.1),
              background: 'linear-gradient(90deg, rgba(30, 64, 175, 0.14), rgba(37, 99, 235, 0.08))',
              backdropFilter: 'blur(6px)',
            },
            '& .bold-header': {
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#0f172a',
            },
            '& .body-cell': {
              fontWeight: 500,
              color: '#1f2937',
            },
            '& .number-cell': {
              fontVariantNumeric: 'tabular-nums',
            },
            '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': {
              outline: 'none',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid rgba(148, 163, 184, 0.2)',
              backgroundColor: 'rgba(248, 250, 252, 0.65)',
            },
            '& .MuiTablePagination-root': {
              fontWeight: 500,
            },
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
            },
            '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
              height: 6,
              width: 6,
            },
            '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(148, 163, 184, 0.6)',
              borderRadius: 999,
            },
            '@media (max-width: 1024px)': {
              '& .MuiDataGrid-columnHeaderTitle': {
                fontSize: '0.82rem',
              },
              '& .MuiDataGrid-cell': {
                fontSize: '0.86rem',
              },
            },
            '@media (max-width: 768px)': {
              '& .MuiDataGrid-columnHeaderTitle': {
                fontSize: '0.78rem',
              },
              '& .MuiDataGrid-cell': {
                fontSize: '0.82rem',
              },
            },
            '@media (max-width: 640px)': {
              '& .MuiDataGrid-cell': {
                paddingTop: '10px',
                paddingBottom: '10px',
              },
            },
          }}
        />
      </Paper>
    </>
  );
};
