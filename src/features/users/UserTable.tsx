// src/features/users/UserTable.tsx

import React from 'react';
import { Box } from '@mui/material';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import { DataTable } from '../../components/common/DataTable';
import type { PaginationState, User } from './userTypes';

interface UserTableProps {
  rows: User[];
  columns: GridColDef<User>[];
  loading: boolean;
  pagination: PaginationState;
  onPaginationChange: (model: GridPaginationModel) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  rows,
  columns,
  loading,
  pagination,
  onPaginationChange,
}) => {
  return (
    <Box sx={{ width: '100%', overflowX: 'auto', p: { xs: 1.5, md: 2 } }}>
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        pagination={pagination}
        getRowId={(row) => row.UserId}
        onPaginationChange={onPaginationChange}
      />
    </Box>
  );
};
