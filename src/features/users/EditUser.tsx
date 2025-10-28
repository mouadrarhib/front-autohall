// src/features/users/EditUser.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Skeleton,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Switch,
  FormControlLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  Stack,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import { authApi } from '../../api/endpoints/auth.api';
import { permissionsApi } from '../../api/endpoints/permissions.api';
import { userRoleApi } from '../../api/endpoints/userRole.api';
import { roleApi } from '../../api/endpoints/role.api';
import { rolePermissionApi } from '../../api/endpoints/rolePermission.api';
import type { Role } from '../../types/role.types';
import type { Permission } from '../../types/permission.types';
import { groupPermissions } from '../../utils/permissionGrouping';

interface Site {
  id: number;
  name: string;
  type: string;
  active: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const EditUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

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
        console.log('Sites data received:', sitesData);

        if (Array.isArray(sitesData)) {
          setSites(sitesData);
        } else if (sitesData && Array.isArray(sitesData.data)) {
          setSites(sitesData.data);
        } else if (sitesData && Array.isArray(sitesData.filiales)) {
          const allSites = [
            ...(sitesData.filiales || []),
            ...(sitesData.succursales || []),
          ];
          setSites(allSites);
        } else {
          console.warn('Unexpected sites data structure:', sitesData);
          setSites([]);
        }
      } catch (sitesError) {
        console.error('Failed to load sites:', sitesError);
        setSites([]);
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
        const permissionsToAdd = userPermissions.filter((id) => !initialUserPermissions.includes(id));
        const permissionsToRemove = initialUserPermissions.filter((id) => !userPermissions.includes(id));

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
      await loadData();
    } catch (err: any) {
      console.error('Failed to update:', err);
      setError(err.response?.data?.error || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const permissionGroups = useMemo(
    () => groupPermissions(rolePermissions, { searchTerm: permissionSearch }),
    [rolePermissions, permissionSearch]
  );

  const hasChanges =
    JSON.stringify(userInfo) !== JSON.stringify(initialUserInfo) ||
    JSON.stringify(userRoles.sort()) !== JSON.stringify(initialUserRoles.sort()) ||
    JSON.stringify(userPermissions.sort()) !== JSON.stringify(initialUserPermissions.sort());

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (error && !user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/users')}
          sx={{ mt: 2 }}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={() => navigate('/users')} size="large">
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Edit User - {userInfo.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage user information, roles, and permissions
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
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
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving || !hasChanges}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </Stack>

      {/* Alerts */}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {hasChanges && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You have unsaved changes. Click "Save Changes" to apply them.
        </Alert>
      )}

      {/* Tabs */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            aria-label="user edit tabs"
          >
            <Tab
              icon={<PersonIcon />}
              iconPosition="start"
              label="User Information"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab
              icon={<SecurityIcon />}
              iconPosition="start"
              label="Roles & Permissions"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        <CardContent>
          {/* Tab 1: User Information */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
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
                    onChange={(e) => setUserInfo({ ...userInfo, idUserSite: Number(e.target.value) })}
                  >
                    {Array.isArray(sites) && sites.length > 0 ? (
                      sites.map((site) => (
                        <MenuItem key={site.id} value={site.id}>
                          {site.name} ({site.type})
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No sites available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userInfo.actif}
                      onChange={(e) => setUserInfo({ ...userInfo, actif: e.target.checked })}
                      disabled={saving}
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
          </TabPanel>

          {/* Tab 2: Roles & Permissions */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              {/* Roles Section */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  User Roles
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {allRoles.length === 0 ? (
                  <Alert severity="info">No roles available</Alert>
                ) : (
                  <Stack spacing={1}>
                    {allRoles.map((role) => (
                      <Card
                        key={role.id}
                        elevation={0}
                        sx={{
                          border: '1px solid',
                          borderColor: userRoles.includes(role.id) ? 'primary.main' : 'divider',
                          bgcolor: userRoles.includes(role.id)
                            ? (theme) => alpha(theme.palette.primary.main, 0.05)
                            : 'transparent',
                        }}
                      >
                        <CardContent sx={{ py: 1.5 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={userRoles.includes(role.id)}
                                onChange={() => handleRoleToggle(role.id)}
                                disabled={saving}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body1" fontWeight={600}>
                                  {role.name}
                                </Typography>
                                {role.description && (
                                  <Typography variant="caption" color="text.secondary">
                                    {role.description}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Grid>

              {/* Permissions Section */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Role Permissions
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {userRoles.length === 0 ? (
                  <Alert severity="info">Please select at least one role to view available permissions</Alert>
                ) : (
                  <>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Select Role to View Permissions</InputLabel>
                      <Select
                        value={selectedRoleId || ''}
                        onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                        disabled={saving}
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
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        {!selectedRoleId ? (
                          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                            Select a role to view its permissions.
                          </Typography>
                        ) : permissionGroups.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                            {permissionSearch
                              ? 'No permissions match your search.'
                              : 'No permissions are attached to this role.'}
                          </Typography>
                        ) : (
                          <List>
                            {permissionGroups.map((group) => (
                              <Box
                                key={group.resourceLabel}
                                sx={{
                                  mb: 1,
                                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                                }}
                              >
                                <ListItem>
                                  <ListItemText
                                    primary={group.resourceLabel}
                                    primaryTypographyProps={{ fontWeight: 700, variant: 'subtitle2' }}
                                  />
                                </ListItem>
                                {group.items.map(({ permission, actionLabel, rawKey }) => (
                                  <ListItem
                                    key={rawKey}
                                    button
                                    onClick={() => !saving && handlePermissionToggle(permission.id)}
                                    sx={{
                                      pl: 4,
                                      pr: 1,
                                      '&:hover': {
                                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                      },
                                    }}
                                  >
                                    <ListItemText primary={actionLabel} />
                                    <ListItemSecondaryAction>
                                      <Checkbox
                                        edge="end"
                                        checked={userPermissions.includes(permission.id)}
                                        onChange={() => handlePermissionToggle(permission.id)}
                                        disabled={saving}
                                      />
                                    </ListItemSecondaryAction>
                                  </ListItem>
                                ))}
                              </Box>
                            ))}
                          </List>
                        )}
                      </Box>
                    )}
                  </>
                )}
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>

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
            label="Confirm Password"
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
            startIcon={changingPassword ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          >
            {changingPassword ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
