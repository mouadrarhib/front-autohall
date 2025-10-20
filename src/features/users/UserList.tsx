// src/features/users/UserList.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Chip,
  IconButton,
  Alert,
  Tooltip,
  Paper,
  Stack,
  useMediaQuery,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SecurityIcon from '@mui/icons-material/Security';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import { DataTable } from '../../components/common/DataTable';
import { authApi } from '../../api/endpoints/auth.api';
import { useAuthStore } from '../../store/authStore';

interface User {
  UserId: number;
  FullName: string;
  Email: string;
  Username: string;
  UserActive: boolean;
  UserEnabled: boolean;
  UserCreatedAt: string;
  UserUpdatedAt: string | null;
  UserSiteId: number | null;
  GroupementType: string | null;
  SiteId: number | null;
  UserSiteActive: boolean | null;
  SiteName: string;
  SiteActive: boolean | null;
  UserRoles: string | null;
  ActiveRolesCount: number;
  UserPermissions: string | null;
  ActivePermissionsCount: number;
  UserStatus: string;
  LastActivity: string | null;
}

export const UserList: React.FC = () => {
  const navigate = useNavigate();
  const hasCreatePermission = useAuthStore((state) => state.hasPermission('USER_CREATE'));
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  const activeUsersCount = useMemo(
    () => users.filter((user) => user.UserActive).length,
    [users]
  );

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
          usersData = response.data;
          total = response.total || response.data.length;
        } else if (Array.isArray(response)) {
          usersData = response;
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
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [pagination.page, pagination.pageSize, loadUsers]);

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

  const baseColumns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'Username',
        headerName: 'Username',
        minWidth: 130,
        flex: 0.9,
        align: 'center',
        headerAlign: 'center',
        cellClassName: 'text-center-cell',
        renderCell: (params) => (
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                maxWidth: '100%',
              }}
            >
              {params.row.Username}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'FullName',
        headerName: 'Full Name',
        minWidth: 180,
        flex: 1.1,
        align: 'center',
        headerAlign: 'center',
        cellClassName: 'text-center-cell',
        renderCell: (params) => (
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                maxWidth: '100%',
              }}
            >
              {params.row.FullName}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'Email',
        headerName: 'Email',
        minWidth: 220,
        flex: 1.4,
        align: 'center',
        headerAlign: 'center',
        cellClassName: 'text-center-cell',
        renderCell: (params) => (
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}
            >
              {params.row.Email}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'GroupementType',
        headerName: 'Groupement',
        minWidth: 150,
        flex: 1,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => {
          const isFiliale = params.row.GroupementType?.toLowerCase() === 'filiale';
          return (
            <Chip
              icon={isFiliale ? <BusinessIcon fontSize="small" /> : <StoreIcon fontSize="small" />}
              label={params.row.GroupementType || '—'}
              size="small"
              sx={{
                bgcolor: alpha(isFiliale ? '#22c55e' : '#0ea5e9', 0.12),
                color: isFiliale ? '#166534' : '#0c4a6e',
                fontWeight: 600,
              }}
            />
          );
        },
      },
      {
        field: 'SiteName',
        headerName: 'Site',
        minWidth: 170,
        flex: 1.1,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography
            variant="body2"
            sx={{
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {params.row.SiteName || '—'}
          </Typography>
        ),
      },
      {
        field: 'UserStatus',
        headerName: 'Status',
        minWidth: 130,
        flex: 0.9,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Chip
            label={params.row.UserActive ? 'Active' : 'Inactive'}
            color={params.row.UserActive ? 'success' : 'default'}
            size="small"
            sx={{
              fontWeight: 600,
              px: 1.5,
              textTransform: 'uppercase',
            }}
          />
        ),
      },
      {
        field: 'ActiveRolesCount',
        headerName: 'Roles',
        minWidth: 120,
        flex: 0.8,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Chip
            label={`${params.row.ActiveRolesCount || 0}`}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: 'rgba(59, 130, 246, 0.12)',
              color: 'primary.main',
            }}
          />
        ),
      },
      {
        field: 'ActivePermissionsCount',
        headerName: 'Permissions',
        minWidth: 140,
        flex: 0.9,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Chip
            label={`${params.row.ActivePermissionsCount || 0}`}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: 'rgba(147, 51, 234, 0.12)',
              color: '#6d28d9',
            }}
          />
        ),
      },
      {
        field: 'LastActivity',
        headerName: 'Last Activity',
        minWidth: 180,
        flex: 1,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            {params.row.LastActivity ? new Date(params.row.LastActivity).toLocaleString() : '—'}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        minWidth: 150,
        flex: 0.9,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="View details" arrow>
              <IconButton
                size="small"
                onClick={(e) => handleViewClick(params.row.UserId, e)}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    color: 'primary.main',
                    transform: 'scale(1.09)',
                  },
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit roles & permissions" arrow>
              <IconButton
                size="small"
                onClick={(e) => handleEditClick(params.row.UserId, e)}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.12),
                    color: 'warning.main',
                    transform: 'scale(1.09)',
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Direct permissions" arrow>
              <IconButton
                size="small"
                onClick={(e) => handlePermissionsClick(params.row.UserId, e)}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.success.main, 0.12),
                    color: 'success.main',
                    transform: 'scale(1.09)',
                  },
                }}
              >
                <SecurityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [handleEditClick, handlePermissionsClick, handleViewClick]
  );

  const columns = useMemo(() => {
    if (isSmallScreen) {
      return baseColumns.filter((column) =>
        ['Username', 'FullName', 'UserStatus', 'actions'].includes(column.field as string)
      );
    }

    if (isMediumScreen) {
      return baseColumns.filter((column) =>
        !['ActivePermissionsCount', 'UserPermissions', 'UserRoles'].includes(column.field as string)
      );
    }

    return baseColumns;
  }, [baseColumns, isMediumScreen, isSmallScreen]);

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
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: { xs: 1.5, sm: 2 },
              p: { xs: 2.5, md: 3 },
              borderBottom: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, rgba(15,23,42,0.05) 0%, rgba(37,99,235,0.08) 100%)',
            }}
          >
            <Stack spacing={0.8} sx={{ width: '100%' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Users Management
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip label={`${totalUsersCount} utilisateurs`} size="small" sx={{ fontWeight: 600 }} />
                <Chip
                  label={`${activeUsersCount} actifs`}
                  size="small"
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
            </Stack>

            {hasCreatePermission && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/users/create')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: { xs: 2.5, sm: 3 },
                  width: { xs: '100%', sm: 'auto' },
                  boxShadow: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Create User
              </Button>
            )}
          </Box>

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

          <Box sx={{ width: '100%', overflowX: 'auto', p: { xs: 1.5, md: 2 } }}>
            <DataTable
              rows={users}
              columns={columns}
              loading={loading}
              pagination={pagination}
              getRowId={(row) => row.UserId}
              onPaginationChange={(model) =>
                setPagination((prev) => ({
                  ...prev,
                  page: model.pageSize !== prev.pageSize ? 1 : model.page,
                  pageSize: model.pageSize,
                }))
              }
            />
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
};
