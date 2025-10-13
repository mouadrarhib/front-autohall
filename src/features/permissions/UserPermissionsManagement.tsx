// src/features/permissions/UserPermissionsManagement.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
  Alert,
  Tooltip,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataTable } from '../../components/common/DataTable';
import { permissionsApi } from '../../api/endpoints/permissions.api';
import { authApi } from '../../api/endpoints/auth.api';
import { useAuthStore } from '../../store/authStore';
import type { Permission } from '../../types/permission.types';

// Updated interface to match backend response
interface UserPermissionLink {
  idUser: number;
  idPermission: number;
  active: boolean;
  permissionName: string;
  permissionActive: boolean;
  TotalRecords?: number;
}

export const UserPermissionsManagement: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const hasLinkPermission = useAuthStore((state) =>
    state.hasPermission('PERMISSION_LINK')
  );

  const [userPermissions, setUserPermissions] = useState<UserPermissionLink[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    totalRecords: 0,
    totalPages: 0,
  });

  const loadUserPermissions = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      console.log('Loading permissions for user:', userId);
      
      const response = await permissionsApi.listUserPermissions(Number(userId), {
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      
      console.log('User permissions response:', response);
      console.log('Permissions data:', response.data);

      setUserPermissions(response.data || []);
      setPagination((prev) => ({
        ...prev,
        totalRecords: response.pagination?.totalCount || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error('Failed to load user permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailablePermissions = async () => {
    try {
      const response = await permissionsApi.listPermissions({
        active: true,
        pageSize: 1000,
      });
      setAvailablePermissions(response.data || []);
    } catch (error) {
      console.error('Failed to load available permissions:', error);
    }
  };

  const loadUserInfo = async () => {
    if (!userId) return;
    try {
      const userInfo = await authApi.getUserCompleteInfo(Number(userId));
      setUser(userInfo);
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

  useEffect(() => {
    loadUserPermissions();
    loadAvailablePermissions();
    loadUserInfo();
  }, [userId, pagination.page, pagination.pageSize]);

  const handleAddPermission = async () => {
    if (!selectedPermission || !userId) return;

    try {
      setError(null);
      await permissionsApi.addUserPermission(Number(userId), {
        idPermission: selectedPermission.id,
      });
      setOpenDialog(false);
      setSelectedPermission(null);
      loadUserPermissions();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add permission');
    }
  };

  const handleRemovePermission = async (permissionId: number, permissionName: string) => {
    if (!userId || !window.confirm(`Remove permission "${permissionName}"?`)) {
      return;
    }

    try {
      await permissionsApi.removeUserPermission(Number(userId), permissionId, false);
      loadUserPermissions();
    } catch (error) {
      console.error('Failed to remove permission:', error);
    }
  };

  const handleToggleActive = async (link: UserPermissionLink) => {
    if (!userId) return;

    try {
      if (link.active) {
        await permissionsApi.deactivateUserPermission(Number(userId), {
          idPermission: link.idPermission,
        });
      } else {
        await permissionsApi.activateUserPermission(Number(userId), {
          idPermission: link.idPermission,
        });
      }
      loadUserPermissions();
    } catch (error) {
      console.error('Failed to toggle permission:', error);
    }
  };

  // Updated columns to match backend field names (lowercase)
  const columns: GridColDef[] = [
    { 
      field: 'permissionName',  // Changed from PermissionName to permissionName
      headerName: 'Permission Name', 
      flex: 1, 
      minWidth: 300 
    },
    {
      field: 'active',  // Changed from UserPermissionActive to active
      headerName: 'User Status',
      width: 130,
      renderCell: (params) => (
        <Tooltip title={hasLinkPermission ? 'Click to toggle' : 'Status'}>
          <Chip
            label={params.value ? 'Active' : 'Inactive'}
            color={params.value ? 'success' : 'default'}
            size="small"
            onClick={() => hasLinkPermission && handleToggleActive(params.row)}
            sx={{ cursor: hasLinkPermission ? 'pointer' : 'default' }}
          />
        </Tooltip>
      ),
    },
    {
      field: 'permissionActive',  // Changed from PermissionActive to permissionActive
      headerName: 'Permission Status',
      width: 150,
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
        <Box>
          {hasLinkPermission && (
            <Tooltip title="Remove Permission">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemovePermission(
                  params.row.idPermission,  // Changed from PermissionId to idPermission
                  params.row.permissionName  // Changed from PermissionName to permissionName
                )}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Tooltip title="Back to Users">
          <IconButton onClick={() => navigate('/users')}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Box flexGrow={1}>
          <Typography variant="h4">
            User Permissions Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.Username || user?.username} - {user?.Email || user?.email}
          </Typography>
        </Box>
        {hasLinkPermission && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Assign Permission
          </Button>
        )}
      </Box>

      {/* User Info Card */}
      {user && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Full Name
                </Typography>
                <Typography variant="body1">
                  {user.FullName || user.full_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {user.Email || user.email}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Total Permissions
                </Typography>
                <Typography variant="body1">
                  <Chip 
                    label={pagination.totalRecords} 
                    size="small" 
                    color="primary"
                  />
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body1">
                  <Chip 
                    label={user.UserActive || user.actif ? 'Active' : 'Inactive'} 
                    size="small" 
                    color={user.UserActive || user.actif ? 'success' : 'default'}
                  />
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <DataTable
        rows={userPermissions.map((p, idx) => ({ ...p, id: idx }))}
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

      {/* Add Permission Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Permission to User</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Autocomplete
            options={availablePermissions}
            getOptionLabel={(option) => option.name}
            value={selectedPermission}
            onChange={(_, newValue) => setSelectedPermission(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Permission"
                placeholder="Search permissions..."
                margin="normal"
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box>
                  <Typography variant="body2">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.active ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
              </li>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddPermission}
            variant="contained"
            disabled={!selectedPermission}
          >
            Assign Permission
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
