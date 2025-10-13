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
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SecurityIcon from '@mui/icons-material/Security';
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

  const columns: GridColDef[] = [
    // ID column removed for security
    { 
      field: 'Username', 
      headerName: 'Username', 
      width: 150,
      flex: 0.5,
    },
    { 
      field: 'FullName', 
      headerName: 'Full Name', 
      width: 200,
      flex: 1,
    },
    { 
      field: 'Email', 
      headerName: 'Email', 
      width: 220,
      flex: 1,
    },
    {
      field: 'SiteName',
      headerName: 'Site',
      width: 150,
      flex: 0.8,
    },
    {
      field: 'ActiveRolesCount',
      headerName: 'Roles',
      width: 90,
      align: 'center',
      renderCell: (params) => (
        <Tooltip title={params.row.UserRoles || 'No roles assigned'}>
          <Chip
            label={params.value || 0}
            size="small"
            color={params.value > 0 ? 'primary' : 'default'}
          />
        </Tooltip>
      ),
    },
    {
      field: 'ActivePermissionsCount',
      headerName: 'Permissions',
      width: 120,
      align: 'center',
      renderCell: (params) => (
        <Tooltip 
          title={
            params.row.UserPermissions 
              ? params.row.UserPermissions.split(', ').slice(0, 5).join(', ') + 
                (params.value > 5 ? '...' : '')
              : 'No permissions assigned'
          }
        >
          <Chip
            label={params.value || 0}
            size="small"
            color={params.value > 0 ? 'success' : 'default'}
          />
        </Tooltip>
      ),
    },
    {
      field: 'UserActive',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/users/${params.row.UserId}`)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit User">
            <IconButton
              size="small"
              onClick={() => navigate(`/users/${params.row.UserId}/edit`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Manage Permissions">
            <IconButton
              size="small"
              onClick={() => navigate(`/users/${params.row.UserId}/permissions`)}
              color="primary"
            >
              <SecurityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Users Management</Typography>
        {hasCreatePermission && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/users/create')}
          >
            Create User
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <DataTable
        rows={users}
        columns={columns}
        pagination={pagination}
        loading={loading}
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
  );
};
