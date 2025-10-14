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
  CircularProgress,
  SxProps,
  Theme,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataTable } from '../../components/common/DataTable';
import { permissionsApi } from '../../api/endpoints/permissions.api';
import { authApi } from '../../api/endpoints/auth.api';
import { userRoleApi } from '../../api/endpoints/userRole.api';
import { rolePermissionApi } from '../../api/endpoints/rolePermission.api';
import { useAuthStore } from '../../store/authStore';
import type { Permission, UserPermissionLink } from '../../types/permission.types';

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
  const [addingPermission, setAddingPermission] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
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
      const response = await permissionsApi.listUserPermissions(Number(userId), {
        page: pagination.page,
        pageSize: pagination.pageSize,
      });

      setUserPermissions(response.data);
      setPagination((prev) => ({
        ...prev,
        totalRecords: response.pagination?.totalCount ?? response.data.length,
        totalPages: response.pagination?.totalPages ?? 1,
      }));
    } catch (error) {
      console.error('Failed to load user permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load available permissions based on user's roles
   * Instead of loading all permissions, we load only permissions
   * that are assigned to the user's roles
   */
  const loadAvailablePermissions = async () => {
    if (!userId) return;

    try {
      // 1. Get user's roles
      const userRoles = await userRoleApi.getRolesByUser(Number(userId), true);
      console.log('User roles:', userRoles);

      if (!userRoles || userRoles.length === 0) {
        setAvailablePermissions([]);
        return;
      }

      // 2. Get permissions for each role and merge them
      const rolePermissionsPromises = userRoles.map((userRole: any) => {
        const roleId = userRole.roleId || userRole.RoleId || userRole.idRole;
        return rolePermissionApi.getPermissionsByRole(roleId, true);
      });

      const rolePermissionsArrays = await Promise.all(rolePermissionsPromises);
      console.log('Role permissions arrays:', rolePermissionsArrays);

      // 3. Flatten and deduplicate permissions
      const permissionsMap = new Map<number, Permission>();
      
      rolePermissionsArrays.forEach((rolePermissions) => {
        rolePermissions.forEach((rp: any) => {
          const permissionId = rp.idPermission || rp.PermissionId;
          const permissionName = rp.permissionName || rp.PermissionName;
          const permissionActive = rp.permissionActive || rp.PermissionActive;

          if (!permissionsMap.has(permissionId)) {
            permissionsMap.set(permissionId, {
              id: permissionId,
              name: permissionName,
              active: permissionActive,
            });
          }
        });
      });

      const uniquePermissions = Array.from(permissionsMap.values());
      console.log('Available permissions (from roles):', uniquePermissions);
      
      setAvailablePermissions(uniquePermissions);
    } catch (error) {
      console.error('Failed to load available permissions:', error);
      setAvailablePermissions([]);
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
      setAddingPermission(true);
      await permissionsApi.addUserPermission(Number(userId), selectedPermission.id);
      setOpenDialog(false);
      setSelectedPermission(null);
      await loadUserPermissions();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add permission');
    } finally {
      setAddingPermission(false);
    }
  };

  const handleRemovePermission = async (permissionId: number, permissionName: string) => {
    if (!userId || !window.confirm(`Remove permission "${permissionName}"?`)) {
      return;
    }

    try {
      setRemovingId(permissionId);
      await permissionsApi.removeUserPermission(Number(userId), permissionId, false);
      // Optimistic update
      setUserPermissions(prev => prev.filter(p => p.idPermission !== permissionId));
      setPagination(prev => ({
        ...prev,
        totalRecords: prev.totalRecords - 1,
      }));
    } catch (error) {
      console.error('Failed to remove permission:', error);
      await loadUserPermissions(); // Reload on error
    } finally {
      setRemovingId(null);
    }
  };

  const handleToggleActive = async (link: UserPermissionLink) => {
    if (!userId || togglingId === link.idPermission) return;

    try {
      setTogglingId(link.idPermission);
      if (link.active) {
        await permissionsApi.deactivateUserPermission(Number(userId), {
          idPermission: link.idPermission,
        });
      } else {
        await permissionsApi.activateUserPermission(Number(userId), {
          idPermission: link.idPermission,
        });
      }

      // Optimistic update
      setUserPermissions(prev =>
        prev.map(p =>
          p.idPermission === link.idPermission
            ? { ...p, active: !p.active }
            : p
        )
      );
    } catch (error) {
      console.error('Failed to toggle permission:', error);
      await loadUserPermissions(); // Reload on error
    } finally {
      setTogglingId(null);
    }
  };

  const statusChipSx: SxProps<Theme> = {
    minWidth: 110,
    height: 28,
    borderRadius: '999px',
    fontWeight: 600,
    px: 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const statusCellSx: SxProps<Theme> = {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const columns: GridColDef[] = [
    {
      field: 'permissionName',
      headerName: 'Permission Name',
      flex: 1,
      minWidth: 300
    },
    {
      field: 'active',
      headerName: 'User Status',
      headerAlign: 'center',
      align: 'center',
      width: 150,
      renderCell: (params) => {
        const isToggling = togglingId === params.row.idPermission;
        return (
          <Box sx={statusCellSx} gap={1}>
            <Box>
              <Chip
                label={params.row.active ? 'Active' : 'Inactive'}
                color={params.row.active ? 'success' : 'default'}
                size="small"
                onClick={() => hasLinkPermission && !isToggling && handleToggleActive(params.row)}
                sx={{
                  cursor: hasLinkPermission && !isToggling ? 'pointer' : 'default',
                  opacity: isToggling ? 0.6 : 1,
                  ...statusChipSx,
                }}
                disabled={isToggling}
              />
            </Box>
            {isToggling && <CircularProgress size={16} />}
          </Box>
        );
      },
    },
    {
      field: 'permissionActive',
      headerName: 'Permission Status',
      headerAlign: 'center',
      align: 'center',
      width: 170,
      renderCell: (params) => (
        <Box sx={statusCellSx}>
          <Chip
            label={params.row.permissionActive ? 'Active' : 'Inactive'}
            color={params.row.permissionActive ? 'success' : 'default'}
            size="small"
            sx={statusChipSx}
          />
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => {
        const isRemoving = removingId === params.row.idPermission;
        return (
          <Box>
            {hasLinkPermission && (
              <Tooltip title="Remove Permission">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() =>
                    handleRemovePermission(
                      params.row.idPermission,
                      params.row.permissionName
                    )
                  }
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <CircularProgress size={20} />
                  ) : (
                    <DeleteIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/users')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          User Permissions Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {user?.Username || user?.username} - {user?.Email || user?.email}
        </Typography>
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

      {user && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">
                  Full Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user.FullName || user.full_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {user.Email || user.email}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">
                  Total Permissions
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {pagination.totalRecords}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box mt={0.5}>
                  <Chip
                    label={user.UserActive || user.active ? 'Active' : 'Inactive'}
                    color={user.UserActive || user.active ? 'success' : 'default'}
                    size="small"
                    sx={statusChipSx}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <DataTable
        rows={userPermissions.map((p) => ({ ...p, id: p.idPermission }))}
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Permission to User</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {availablePermissions.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No permissions available. The user must have at least one role with assigned permissions.
            </Alert>
          ) : (
            <Autocomplete
              options={availablePermissions}
              getOptionLabel={(option) => option.name}
              value={selectedPermission}
              onChange={(_, newValue) => setSelectedPermission(newValue)}
              disabled={addingPermission}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Permission"
                  placeholder="Search permissions from user's roles..."
                  margin="normal"
                  fullWidth
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box display="flex" justifyContent="space-between" width="100%">
                    <Typography>{option.name}</Typography>
                    <Chip
                      label={option.active ? 'Active' : 'Inactive'}
                      size="small"
                      color={option.active ? 'success' : 'default'}
                    />
                  </Box>
                </li>
              )}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={addingPermission}>
            Cancel
          </Button>
          <Button
            onClick={handleAddPermission}
            variant="contained"
            disabled={!selectedPermission || addingPermission}
            startIcon={addingPermission ? <CircularProgress size={16} /> : null}
          >
            {addingPermission ? 'Assigning...' : 'Assign Permission'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
