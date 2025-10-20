// src/features/users/UserList.tsx

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Paper, Stack, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { GridPaginationModel } from '@mui/x-data-grid';

import { authApi } from '../../api/endpoints/auth.api';
import { useAuthStore } from '../../store/authStore';
import { UserHeader } from './UserHeader';
import { UserTable } from './UserTable';
import { useUserColumns } from './useUserColumns';
import type { PaginationState, User } from './userTypes';

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  pageSize: 10,
  totalRecords: 0,
  totalPages: 0,
};

export const UserList: React.FC = () => {
  const navigate = useNavigate();
  const hasCreatePermission = useAuthStore((state) => state.hasPermission('USER_CREATE'));
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);

  const activeUsersCount = useMemo(() => users.filter((user) => user.UserActive).length, [users]);

  const totalUsersCount = useMemo(
    () => pagination.totalRecords || users.length,
    [pagination.totalRecords, users.length]
  );

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.getAllUsers({ active_only: false });

      let usersData: User[] = [];
      let total = 0;

      if (response && typeof response === 'object') {
        if ('data' in response && Array.isArray(response.data)) {
          usersData = response.data as User[];
          total = (response as any).total ?? response.data.length;
        } else if (Array.isArray(response)) {
          usersData = response as User[];
          total = response.length;
        }
      }

      setUsers(usersData);
      setPagination((prev) => ({
        ...prev,
        totalRecords: total,
        totalPages: Math.ceil(total / prev.pageSize),
      }));
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err?.response?.data?.error ?? 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers, pagination.page, pagination.pageSize]);

  const handleViewClick = useCallback(
    (userId: number, event: React.MouseEvent) => {
      event.stopPropagation();
      navigate(`/users/${userId}`);
    },
    [navigate]
  );

  const handleEditClick = useCallback(
    (userId: number, event: React.MouseEvent) => {
      event.stopPropagation();
      navigate(`/users/${userId}/edit`);
    },
    [navigate]
  );

  const handlePermissionsClick = useCallback(
    (userId: number, event: React.MouseEvent) => {
      event.stopPropagation();
      navigate(`/users/${userId}/permissions`);
    },
    [navigate]
  );

  const columns = useUserColumns({
    isSmallScreen,
    isMediumScreen,
    onView: handleViewClick,
    onEdit: handleEditClick,
    onPermissions: handlePermissionsClick,
  });

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPagination((prev) => ({
      ...prev,
      page: model.pageSize !== prev.pageSize ? 1 : model.page,
      pageSize: model.pageSize,
    }));
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={2.5}>
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: 'background.paper',
          }}
        >
          <UserHeader
            totalUsers={totalUsersCount}
            activeUsers={activeUsersCount}
            hasCreatePermission={hasCreatePermission}
            onCreate={() => navigate('/users/create')}
          />

          {error && (
            <Box sx={{ p: { xs: 2, md: 2.5 } }}>
              <Alert
                severity="error"
                onClose={() => setError(null)}
                sx={{
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    width: '100%',
                  },
                }}
              >
                {error}
              </Alert>
            </Box>
          )}

          <UserTable
            rows={users}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
          />
        </Paper>
      </Stack>
    </Box>
  );
};
