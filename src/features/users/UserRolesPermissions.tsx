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
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { authApi } from '../../api/endpoints/auth.api';
import { permissionsApi } from '../../api/endpoints/permissions.api';
import { userRoleApi } from '../../api/endpoints/userRole.api';
import { roleApi } from '../../api/endpoints/role.api';
import { rolePermissionApi } from '../../api/endpoints/rolePermission.api';
import type { Role } from '../../types/role.types';
import type { Permission } from '../../types/permission.types';

interface Site {
  id: number;
  name: string;
  type: string;
  active: boolean;
}

export const UserRolesPermissions: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // User Info State
  const [userInfo, setUserInfo] = useState({
    username: '',
    fullName: '',
    email: '',
    idUserSite: 0,
    actif: true,
  });
  const [initialUserInfo, setInitialUserInfo] = useState({
    username: '',
    fullName: '',
    email: '',
    idUserSite: 0,
    actif: true,
  });

  // Password Dialog
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  // Roles state
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<number[]>([]);
  const [initialUserRoles, setInitialUserRoles] = useState<number[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  // Permissions state
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

    // Load user data first
    const userData = await authApi.getUserCompleteInfo(userIdNum);
    console.log('User data:', userData);
    setUser(userData);

    // Load sites data with proper error handling
    try {
      const sitesData = await authApi.getAvailableSites();
      console.log('Sites data received:', sitesData); // Debug log
      
      // Handle different response structures
      if (Array.isArray(sitesData)) {
        setSites(sitesData);
      } else if (sitesData && Array.isArray(sitesData.data)) {
        setSites(sitesData.data);
      } else if (sitesData && Array.isArray(sitesData.filiales)) {
        // Backend might return { filiales: [...], succursales: [...] }
        const allSites = [
          ...(sitesData.filiales || []),
          ...(sitesData.succursales || [])
        ];
        setSites(allSites);
      } else {
        console.warn('Unexpected sites data structure:', sitesData);
        setSites([]);
      }
    } catch (sitesError) {
      console.error('Failed to load sites:', sitesError);
      setSites([]); // Set empty array on error
    }

    // Set user info
    const info = {
      username: userData.Username || userData.username || '',
      fullName: userData.FullName || userData.full_name || '',
      email: userData.Email || userData.email || '',
      idUserSite: userData.UserSiteId || userData.idUserSite || 0,
      actif: userData.UserActive !== undefined ? userData.UserActive : userData.actif,
    };
    setUserInfo(info);
    setInitialUserInfo(info);

    // Load roles
    const rolesData = await roleApi.listRoles();
    setAllRoles(rolesData.filter((r: Role) => r.active));

    // Load user roles
    const userRolesData = await userRoleApi.getRolesByUser(userIdNum, false);
    const activeRoleIds = userRolesData
      .filter((ur: any) => ur.active || ur.Active)
      .map((ur: any) => ur.roleId || ur.RoleId || ur.idRole);
    setUserRoles(activeRoleIds);
    setInitialUserRoles(activeRoleIds);

    if (activeRoleIds.length > 0) {
      setSelectedRoleId(activeRoleIds[0]);
    }

    // Load user permissions
    const userPermissionsResponse = await permissionsApi.listUserPermissions(userIdNum);
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
      const permissions = await rolePermissionApi.getPermissionsByRole(roleId, true);
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

    if (!newRoles.includes(roleId) && selectedRoleId === roleId) {
      setSelectedRoleId(newRoles.length > 0 ? newRoles[0] : null);
    }

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

  const handleToggleActive = async () => {
    if (!userId) return;

    try {
      setSaving(true);
      setError(null);

      if (userInfo.actif) {
        await authApi.deactivateUser(Number(userId));
        setUserInfo({ ...userInfo, actif: false });
        setSuccess('User deactivated successfully!');
      } else {
        await authApi.activateUser(Number(userId));
        setUserInfo({ ...userInfo, actif: true });
        setSuccess('User activated successfully!');
      }

      await loadData();
    } catch (err: any) {
      console.error('Failed to toggle user status:', err);
      setError(err.response?.data?.error || 'Failed to update user status');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!userId) return;

    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in both password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    try {
      setChangingPassword(true);
      setPasswordError(null);

      await authApi.updateUserPassword(Number(userId), newPassword);

      setSuccess('Password updated successfully!');
      setOpenPasswordDialog(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Failed to update password:', err);
      setPasswordError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const userIdNum = Number(userId);

      // Save user info if changed
      if (JSON.stringify(userInfo) !== JSON.stringify(initialUserInfo)) {
        console.log('Updating user info:', userInfo);
        await authApi.updateUser(userIdNum, {
          username: userInfo.username,
          fullName: userInfo.fullName,
          email: userInfo.email,
          idUserSite: userInfo.idUserSite,
          actif: userInfo.actif,
        });
      }

      // Save roles if changed
      if (JSON.stringify(userRoles.sort()) !== JSON.stringify(initialUserRoles.sort())) {
        console.log('Syncing roles:', userRoles);
        await userRoleApi.syncRolesForUser(userIdNum, userRoles, true);
      }

      // Save permissions if changed
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

      setSuccess('User information, roles, and permissions updated successfully');
      
      // Reload data
      await loadData();
    } catch (err: any) {
      console.error('Failed to update:', err);
      setError(err.response?.data?.error || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const filteredPermissions = rolePermissions.filter((permission) =>
    permission.name.toLowerCase().includes(permissionSearch.toLowerCase())
  );

  const hasChanges =
    JSON.stringify(userInfo) !== JSON.stringify(initialUserInfo) ||
    JSON.stringify(userRoles.sort()) !== JSON.stringify(initialUserRoles.sort()) ||
    JSON.stringify(userPermissions.sort()) !== JSON.stringify(initialUserPermissions.sort());

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (error && !user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/users')} sx={{ mt: 2 }}>
          Back to Users
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/users')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={600}>
            Manage User - {userInfo.username}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<LockResetIcon />}
            onClick={() => setOpenPasswordDialog(true)}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Change Password
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving || !hasChanges}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

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
        {/* User Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                User Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={userInfo.username}
                    onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
                    required
                    disabled={saving}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={userInfo.fullName}
                    onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                    required
                    disabled={saving}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    required
                    disabled={saving}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
  <FormControl fullWidth required disabled={saving}>
    <InputLabel>Site Assignment</InputLabel>
    <Select
      value={userInfo.idUserSite}
      label="Site Assignment"
      onChange={(e) => setUserInfo({ ...userInfo, idUserSite: Number(e.target.value) })}
    >
      {Array.isArray(sites) && sites.length > 0 ? (
        sites.map((site) => (
          <MenuItem key={site.id} value={site.id}>
            {site.name} ({site.type})
          </MenuItem>
        ))
      ) : (
        <MenuItem value={0} disabled>
          No sites available
        </MenuItem>
      )}
    </Select>
  </FormControl>
</Grid>


                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userInfo.actif}
                        onChange={handleToggleActive}
                        disabled={saving}
                        color="success"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {userInfo.actif ? 'Active' : 'Inactive'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {userInfo.actif
                            ? 'User can log in and access the system'
                            : 'User cannot log in or access the system'}
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Roles Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                User Roles
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {allRoles.length === 0 ? (
                <Typography color="text.secondary">No roles available</Typography>
              ) : (
                <List>
                  {allRoles.map((role) => (
                    <ListItem key={role.id} dense>
                      <ListItemText primary={role.name} secondary={role.description} />
                      <ListItemSecondaryAction>
                        <Checkbox
                          edge="end"
                          checked={userRoles.includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                          disabled={saving}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Permissions Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Role Permissions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {userRoles.length === 0 ? (
                <Typography color="text.secondary">
                  Please select at least one role to view available permissions
                </Typography>
              ) : (
                <>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Select Role to View Permissions</InputLabel>
                    <Select
                      value={selectedRoleId || ''}
                      label="Select Role to View Permissions"
                      onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                      disabled={saving}
                    >
                      {userRoles.map((roleId) => {
                        const role = allRoles.find((r) => r.id === roleId);
                        return role ? (
                          <MenuItem key={roleId} value={roleId}>
                            {role.name}
                          </MenuItem>
                        ) : null;
                      })}
                    </Select>
                  </FormControl>

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

                  {loadingPermissions ? (
                    <CircularProgress />
                  ) : (
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {filteredPermissions.length === 0 ? (
                        <Typography color="text.secondary">No permissions found</Typography>
                      ) : (
                        filteredPermissions.map((permission) => (
                          <ListItem key={permission.id} dense>
                            <ListItemText primary={permission.name} />
                            <ListItemSecondaryAction>
                              <Checkbox
                                edge="end"
                                checked={userPermissions.includes(permission.id)}
                                onChange={() => handlePermissionToggle(permission.id)}
                                disabled={saving}
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

      {/* Change Password Dialog */}
      <Dialog
        open={openPasswordDialog}
        onClose={() => !changingPassword && setOpenPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}
          <TextField
            fullWidth
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={changingPassword}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={changingPassword}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenPasswordDialog(false);
              setNewPassword('');
              setConfirmPassword('');
              setPasswordError(null);
            }}
            disabled={changingPassword}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={changingPassword}
            startIcon={changingPassword ? <CircularProgress size={20} /> : <LockResetIcon />}
          >
            {changingPassword ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
