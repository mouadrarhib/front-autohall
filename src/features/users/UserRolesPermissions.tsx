// src/features/users/UserRolesPermissions.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Alert,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  TextField,
  InputAdornment,
  CircularProgress,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import { authApi } from '../../api/endpoints/auth.api';
import { permissionsApi } from '../../api/endpoints/permissions.api';
import { userRoleApi } from '../../api/endpoints/userRole.api';
import { roleApi } from '../../api/endpoints/role.api';
import { rolePermissionApi } from '../../api/endpoints/rolePermission.api';
import type { Role } from '../../types/role.types';
import type { Permission } from '../../types/permission.types';

export const UserRolesPermissions: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Roles state
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<number[]>([]);
  const [initialUserRoles, setInitialUserRoles] = useState<number[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  // Permissions state (based on selected role)
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<number[]>([]);
  const [initialUserPermissions, setInitialUserPermissions] = useState<number[]>([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  useEffect(() => {
    if (selectedRoleId) {
      loadRolePermissions(selectedRoleId);
    }
  }, [selectedRoleId]);

  const loadData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const userIdNum = Number(userId);

      // Load user, all roles, user's roles, and user's permissions
      const [userData, rolesData, userRolesData, userPermissionsResponse] = await Promise.all([
        authApi.getUserCompleteInfo(userIdNum),
        roleApi.listRoles(),
        userRoleApi.getRolesByUser(userIdNum, false),
        permissionsApi.listUserPermissions(userIdNum),
      ]);

      console.log('User data:', userData);
      console.log('All roles:', rolesData);
      console.log('User roles:', userRolesData);
      console.log('User permissions:', userPermissionsResponse);

      setUser(userData);
      setAllRoles(rolesData.filter((r: Role) => r.active));

      // Extract role IDs from user's current roles (only active ones)
      const activeRoleIds = userRolesData
        .filter((ur: any) => ur.active || ur.Active)
        .map((ur: any) => ur.roleId || ur.RoleId || ur.idRole);
      setUserRoles(activeRoleIds);
      setInitialUserRoles(activeRoleIds);

      // Set first role as selected if user has roles
      if (activeRoleIds.length > 0) {
        setSelectedRoleId(activeRoleIds[0]);
      }

      // Extract permission IDs from user's current permissions (only active ones)
      const activePermissionIds = userPermissionsResponse.data
        .filter((up: any) => up.active || up.Active)
        .map((up: any) => up.idPermission || up.PermissionId);
      setUserPermissions(activePermissionIds);
      setInitialUserPermissions(activePermissionIds);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.response?.data?.error || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const loadRolePermissions = async (roleId: number) => {
    try {
      setLoadingPermissions(true);
      
      // Get permissions assigned to this role
      const permissions = await rolePermissionApi.getPermissionsByRole(roleId, true);
      
      console.log('Role permissions:', permissions);
      
      // Transform to Permission objects
      const permissionObjects = permissions.map((rp: any) => ({
        id: rp.idPermission,
        name: rp.permissionName || rp.PermissionName,
        active: rp.permissionActive || rp.PermissionActive,
      }));
      
      setRolePermissions(permissionObjects);
    } catch (err: any) {
      console.error('Failed to load role permissions:', err);
      setError(err.response?.data?.error || 'Failed to load role permissions');
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    const newRoles = userRoles.includes(roleId)
      ? userRoles.filter((id) => id !== roleId)
      : [...userRoles, roleId];
    
    setUserRoles(newRoles);

    // If we removed the selected role, switch to first available role
    if (!newRoles.includes(roleId) && selectedRoleId === roleId) {
      setSelectedRoleId(newRoles.length > 0 ? newRoles[0] : null);
    }
    
    // If this is the first role being added, select it
    if (!selectedRoleId && newRoles.length > 0) {
      setSelectedRoleId(newRoles[0]);
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setUserPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleRoleChange = (roleId: number) => {
    setSelectedRoleId(roleId);
  };

  const handleSave = async () => {
    if (!userId) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const userIdNum = Number(userId);

      // Save roles using sync endpoint
      if (JSON.stringify(userRoles.sort()) !== JSON.stringify(initialUserRoles.sort())) {
        console.log('Syncing roles:', userRoles);
        await userRoleApi.syncRolesForUser(userIdNum, userRoles, true);
      }

      // Save permissions individually (add/remove)
      if (JSON.stringify(userPermissions.sort()) !== JSON.stringify(initialUserPermissions.sort())) {
        const permissionsToAdd = userPermissions.filter(
          (id) => !initialUserPermissions.includes(id)
        );
        const permissionsToRemove = initialUserPermissions.filter(
          (id) => !userPermissions.includes(id)
        );

        console.log('Permissions to add:', permissionsToAdd);
        console.log('Permissions to remove:', permissionsToRemove);

        for (const permissionId of permissionsToAdd) {
          await permissionsApi.addUserPermission(userIdNum, permissionId);
        }

        for (const permissionId of permissionsToRemove) {
          await permissionsApi.removeUserPermission(userIdNum, permissionId, false);
        }
      }

      setSuccess('User roles and permissions updated successfully');
      setInitialUserRoles(userRoles);
      setInitialUserPermissions(userPermissions);
      
      // Reload user data to confirm changes
      await loadData();
    } catch (err: any) {
      console.error('Failed to update:', err);
      setError(err.response?.data?.error || 'Failed to update user roles and permissions');
    } finally {
      setSaving(false);
    }
  };

  const filteredPermissions = rolePermissions.filter((permission) =>
    permission.name.toLowerCase().includes(permissionSearch.toLowerCase())
  );

  const hasChanges =
    JSON.stringify(userRoles.sort()) !== JSON.stringify(initialUserRoles.sort()) ||
    JSON.stringify(userPermissions.sort()) !== JSON.stringify(initialUserPermissions.sort());

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (error && !user) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/users')} sx={{ mt: 2 }}>
          Back to Users
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/users')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Manage Roles & Permissions - {user?.username || user?.Username}
        </Typography>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {/* User Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Username
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {user?.username || user?.Username}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Full Name
              </Typography>
              <Typography variant="body1">
                {user?.full_name || user?.FullName}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {user?.email || user?.Email}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {hasChanges && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have unsaved changes. Click "Save Changes" to apply them.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Roles Section */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">User Roles</Typography>
                <Chip label={userRoles.length} size="small" color="primary" />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                {allRoles.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No roles available" />
                  </ListItem>
                ) : (
                  allRoles.map((role) => (
                    <ListItem
                      key={role.id}
                      divider
                      sx={{
                        bgcolor: selectedRoleId === role.id ? 'action.selected' : 'transparent',
                      }}
                    >
                      <ListItemText
                        primary={role.name}
                        secondary={role.description}
                      />
                      <ListItemSecondaryAction>
                        <Checkbox
                          edge="end"
                          checked={userRoles.includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Permissions Section */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Role Permissions</Typography>
                <Chip label={userPermissions.length} size="small" color="success" />
              </Box>
              <Divider sx={{ mb: 2 }} />

              {userRoles.length === 0 ? (
                <Alert severity="info">
                  Please select at least one role to view available permissions
                </Alert>
              ) : (
                <>
                  {/* Role Selector */}
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Select Role to View Permissions</InputLabel>
                    <Select
                      value={selectedRoleId || ''}
                      label="Select Role to View Permissions"
                      onChange={(e) => handleRoleChange(Number(e.target.value))}
                    >
                      {userRoles.map((roleId) => {
                        const role = allRoles.find((r) => r.id === roleId);
                        return role ? (
                          <MenuItem key={role.id} value={role.id}>
                            {role.name}
                          </MenuItem>
                        ) : null;
                      })}
                    </Select>
                  </FormControl>

                  {/* Permission Search */}
                  <TextField
                    fullWidth
                    placeholder="Search permissions..."
                    value={permissionSearch}
                    onChange={(e) => setPermissionSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />

                  {/* Permissions List */}
                  {loadingPermissions ? (
                    <Box display="flex" justifyContent="center" p={3}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {filteredPermissions.length === 0 ? (
                        <ListItem>
                          <ListItemText 
                            primary="No permissions found" 
                            secondary={selectedRoleId ? "This role has no permissions assigned" : "Select a role first"}
                          />
                        </ListItem>
                      ) : (
                        filteredPermissions.map((permission) => (
                          <ListItem key={permission.id} divider>
                            <ListItemText
                              primary={permission.name}
                              secondary={`ID: ${permission.id}`}
                            />
                            <ListItemSecondaryAction>
                              <Checkbox
                                edge="end"
                                checked={userPermissions.includes(permission.id)}
                                onChange={() => handlePermissionToggle(permission.id)}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))
                      )}
                    </List>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
