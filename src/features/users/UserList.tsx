// src/features/users/UserList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Chip,
  IconButton,
  Alert,
  Tooltip,
  Card,
  alpha,
} from '@mui/material';
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
  const hasCreatePermission = useAuthStore((state) =>
    state.hasPermission('USER_CREATE')
  );

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  const loadUsers = async () => {
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
  };

  useEffect(() => {
    loadUsers();
  }, [pagination.page, pagination.pageSize]);

  const handleViewClick = (userId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/users/${userId}`);
  };

  const handleEditClick = (userId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/users/${userId}/edit`);
  };

  const handlePermissionsClick = (userId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/users/${userId}/permissions`);
  };

  const columns: GridColDef[] = [
    {
      field: 'Username',
      headerName: 'Username',
      minWidth: 130,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      cellClassName: 'text-center-cell',
      renderCell: (params) => (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
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
      flex: 1.2,
      align: 'center',
      headerAlign: 'center',
      cellClassName: 'text-center-cell',
      renderCell: (params) => (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
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
      minWidth: 200,
      flex: 1.5,
      align: 'center',
      headerAlign: 'center',
      cellClassName: 'text-center-cell',
      renderCell: (params) => (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              maxWidth: '100%',
            }}
          >
            {params.row.Email}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'SiteName',
      headerName: 'Site',
      minWidth: 140,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      cellClassName: 'text-center-cell',
      renderCell: (params) => (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
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
            {params.row.SiteName || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'GroupementType',
      headerName: 'Type',
      minWidth: 130,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const type = params.row.GroupementType;
        if (!type) {
          return (
            <Chip
              label="N/A"
              size="small"
              variant="outlined"
              sx={{
                borderColor: 'grey.300',
                color: 'text.disabled',
                fontWeight: 500,
              }}
            />
          );
        }

        const isFiliale = type === 'Filiale';
        return (
          <Chip
            icon={isFiliale ? <BusinessIcon /> : <StoreIcon />}
            label={type}
            size="small"
            color={isFiliale ? 'primary' : 'secondary'}
            sx={{
              fontWeight: 500,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 1,
              },
            }}
          />
        );
      },
    },
    {
      field: 'ActiveRolesCount',
      headerName: 'Roles',
      minWidth: 90,
      flex: 0.5,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.row.ActiveRolesCount}
          size="small"
          color={params.row.ActiveRolesCount > 0 ? 'primary' : 'default'}
          sx={{
            fontWeight: 600,
            minWidth: '36px',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
            },
          }}
        />
      ),
    },
    {
      field: 'ActivePermissionsCount',
      headerName: 'Permissions',
      minWidth: 120,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Tooltip
          title={
            params.row.UserPermissions
              ? params.row.UserPermissions.split(',').length > 5
                ? params.row.UserPermissions
                : ''
              : 'No permissions assigned'
          }
          arrow
          placement="top"
        >
          <Chip
            label={params.row.ActivePermissionsCount}
            size="small"
            color={params.row.ActivePermissionsCount > 0 ? 'success' : 'default'}
            sx={{
              fontWeight: 600,
              minWidth: '36px',
              transition: 'all 0.2s ease',
              cursor: params.row.ActivePermissionsCount > 0 ? 'help' : 'default',
              '&:hover': {
                transform: params.row.ActivePermissionsCount > 0 ? 'scale(1.1)' : 'none',
              },
            }}
          />
        </Tooltip>
      ),
    },
    {
      field: 'UserActive',
      headerName: 'Status',
      minWidth: 110,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.row.UserActive ? 'Active' : 'Inactive'}
          color={params.row.UserActive ? 'success' : 'default'}
          size="small"
          sx={{
            fontWeight: 500,
            transition: 'all 0.2s ease',
          }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 140,
      flex: 0.7,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      cellClassName: 'action-cell',
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <Tooltip title="View Details" arrow>
            <IconButton
              size="small"
              onClick={(e) => handleViewClick(params.row.UserId, e)}
              sx={{
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.info.main, 0.1),
                  color: 'info.main',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Roles & Permissions" arrow>
            <IconButton
              size="small"
              onClick={(e) => handleEditClick(params.row.UserId, e)}
              sx={{
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.1),
                  color: 'warning.main',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Direct Permissions" arrow>
            <IconButton
              size="small"
              onClick={(e) => handlePermissionsClick(params.row.UserId, e)}
              sx={{
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <SecurityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 3,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Users Management
          </Typography>
          {hasCreatePermission && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/users/create')}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
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
          <Box sx={{ p: 2 }}>
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

        <Box sx={{ height: '100%', width: '100%' }}>
          <DataTable
            rows={users}
            columns={columns}
            loading={loading}
            pagination={pagination}
            getRowId={(row) => row.UserId}
            onPaginationChange={(model) =>
              setPagination((prev) => ({
                ...prev,
                page: model.page,
                pageSize: model.pageSize,
              }))
            }
          />
        </Box>
      </Card>
    </Box>
  );
};
