// src/features/permissions/PermissionUsers.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Chip,
  IconButton,
  Card,
  CardContent,
  Grid,
  Alert,
  Skeleton,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DataTable } from '../../components/common/DataTable';
import { permissionsApi } from '../../api/endpoints/permissions.api';

// Updated interface to match backend response (snake_case)
interface UserPermissionLink {
  idUser: number;
  idPermission: number;
  active: boolean;
  username: string;        // snake_case
  email: string;           // snake_case
  userActive: boolean;     // camelCase
  TotalRecords?: number;
}

export const PermissionUsers: React.FC = () => {
  const { permissionId } = useParams<{ permissionId: string }>();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<UserPermissionLink[]>([]);
  const [permission, setPermission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    totalRecords: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!permissionId) return;

      try {
        setLoading(true);
        
        console.log('Loading permission and users for ID:', permissionId);
        
        // Load permission details
        const permissionData = await permissionsApi.getPermissionById(Number(permissionId));
        console.log('Permission data:', permissionData);
        setPermission(permissionData);
        
        // Load users with this permission
        const usersResponse = await permissionsApi.listUsersByPermission(
          Number(permissionId),
          { page: pagination.page, pageSize: pagination.pageSize }
        );
        
        console.log('Users response:', usersResponse);
        
        // Handle nested data structure
        let usersData: UserPermissionLink[] = [];
        let paginationData = {
          totalCount: 0,
          totalPages: 0,
        };

        if (usersResponse && typeof usersResponse === 'object') {
          if ('data' in usersResponse && Array.isArray(usersResponse.data)) {
            usersData = usersResponse.data;
            paginationData = usersResponse.pagination || paginationData;
          } else if (Array.isArray(usersResponse)) {
            usersData = usersResponse;
          }
        }
        
        console.log('Processed users:', usersData);
        setUsers(usersData);
        setPagination((prev) => ({
          ...prev,
          totalRecords: paginationData.totalCount || usersData.length,
          totalPages: paginationData.totalPages || 1,
        }));
      } catch (err: any) {
        console.error('Failed to load data:', err);
        setError(err.response?.data?.error || 'Failed to load users with this permission');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [permissionId, pagination.page, pagination.pageSize]);

  const handleViewUser = (userId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/users/${userId}`);
  };

  // FIXED: Column field names now match backend response (snake_case/camelCase)
  const columns: GridColDef[] = [
    {
      field: 'username',  // Changed from Username
      headerName: 'Username',
      flex: 0.5,
      minWidth: 150,
    },
    {
      field: 'email',  // Changed from Email
      headerName: 'Email',
      flex: 1,
      minWidth: 220,
    },
    {
      field: 'active',
      headerName: 'Permission Status',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'userActive',  // Changed from UserActive
      headerName: 'User Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'info' : 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => handleViewUser(params.row.idUser, e)}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/permissions')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Users with {permission?.name}
        </Typography>
      </Box>

      {permission && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">
                  Permission Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {permission.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">
                  Permission Status
                </Typography>
                <Typography variant="body1">
                  <Chip 
                    label={permission.active ? 'Active' : 'Inactive'} 
                    color={permission.active ? 'success' : 'default'}
                    size="small"
                  />
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">
                  Total Users
                </Typography>
                <Typography variant="body1">
                  <Chip label={pagination.totalRecords} color="primary" size="small" />
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {users.length === 0 && !loading && !error && (
        <Alert severity="info">
          No users have been assigned this permission yet.
        </Alert>
      )}

      <DataTable
        rows={users.map((u, idx) => ({ ...u, id: idx }))}
        columns={columns}
        pagination={pagination}
        loading={loading}
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
