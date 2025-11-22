// src/features/users/EditUser.tsx

import React, { useEffect, useState } from 'react';
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
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  Stack,
  Tabs,
  Tab,
  Checkbox,
  Chip,
  FormHelperText,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import { authApi } from '../../api/endpoints/auth.api';
import { userRoleApi } from '../../api/endpoints/userRole.api';
import { roleApi } from '../../api/endpoints/role.api';
import type { Role } from '../../types/role.types';

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
  const { id: userId } = useParams<{ id: string }>();
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

  useEffect(() => {
    loadData();
  }, [userId]);

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
        idUserSite:
          userData.userSiteId ??
          userData.UserSiteId ??
          userData.idUserSite ??
          0,
        actif: userData.userActive,
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
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.response?.data?.error || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    const newRoles = userRoles.includes(roleId)
      ? userRoles.filter((id) => id !== roleId)
      : [...userRoles, roleId];
    setUserRoles(newRoles);
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

      setSuccess('User information and roles updated successfully');
      await loadData();
    } catch (err: any) {
      console.error('Failed to update:', err);
      setError(err.response?.data?.error || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    JSON.stringify(userInfo) !== JSON.stringify(initialUserInfo) ||
    JSON.stringify(userRoles.sort()) !== JSON.stringify(initialUserRoles.sort());

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
              Manage user information and roles
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
              label="Roles"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        <CardContent>
          {/* Tab 1: User Information */}
          <TabPanel value={activeTab} index={0}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Account Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Update the user’s core information and status.
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={userInfo.actif ? 'Active' : 'Inactive'}
                  color={userInfo.actif ? 'success' : 'default'}
                  variant={userInfo.actif ? 'filled' : 'outlined'}
                />
              </Stack>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={userInfo.username}
                    onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
                    required
                    disabled={saving}
                    helperText="The unique handle used for login"
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
                    helperText="Display name shown across the app"
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
                    helperText="Used for notifications and recovery"
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
                        <MenuItem disabled>No sites available</MenuItem>
                      )}
                    </Select>
                    <FormHelperText>Select the site where the user operates</FormHelperText>
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
                    sx={{
                      px: 1.5,
                      py: 1,
                      border: (theme) => `1px dashed ${theme.palette.divider}`,
                      borderRadius: 2,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.01),
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>

          {/* Tab 2: Roles */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={10} lg={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                    boxShadow: (theme) => theme.shadows[1],
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        User Roles
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Assign roles to control the user's access.
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={`Selected: ${userRoles.length}`}
                      color={userRoles.length > 0 ? 'primary' : 'default'}
                      variant={userRoles.length > 0 ? 'filled' : 'outlined'}
                    />
                  </Stack>
                  <Divider sx={{ my: 2 }} />

                  {allRoles.length === 0 ? (
                    <Alert severity="info">No roles available</Alert>
                  ) : (
                    <Grid container spacing={2.5}>
                      {allRoles.map((role) => {
                        const isSelected = userRoles.includes(role.id);
                        return (
                          <Grid item xs={12} sm={6} key={role.id}>
                            <Card
                              variant="outlined"
                              sx={{
                                height: '100%',
                                borderColor: isSelected ? 'primary.light' : 'divider',
                                bgcolor: isSelected
                                  ? (theme) => alpha(theme.palette.primary.main, 0.06)
                                  : 'background.paper',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  boxShadow: (theme) =>
                                    isSelected ? '0 8px 18px rgba(37, 99, 235, 0.18)' : theme.shadows[2],
                                },
                              }}
                            >
                              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                  <Box>
                                    <Typography variant="subtitle1" fontWeight={700}>
                                      {role.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {role.description || 'No description provided'}
                                    </Typography>
                                  </Box>
                                  {isSelected && (
                                    <Chip
                                      size="small"
                                      label="Selected"
                                      color="primary"
                                      variant="filled"
                                      sx={{ fontWeight: 700 }}
                                    />
                                  )}
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Chip
                                    size="small"
                                    label={role.active ? 'Active' : 'Inactive'}
                                    color={role.active ? 'success' : 'default'}
                                    variant={role.active ? 'filled' : 'outlined'}
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    ID: {role.id}
                                  </Typography>
                                </Stack>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={isSelected}
                                      onChange={() => handleRoleToggle(role.id)}
                                      disabled={saving || !role.active}
                                      color="primary"
                                    />
                                  }
                                  label={
                                    <Typography variant="body2" color={role.active ? 'text.secondary' : 'text.disabled'}>
                                      {role.active
                                        ? isSelected
                                          ? 'Assigned to this user'
                                          : 'Assign this role'
                                        : 'Inactive role (cannot assign)'}
                                    </Typography>
                                  }
                                  sx={{ m: 0, alignItems: 'flex-start' }}
                                />
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}

                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 3 }}>
                    <Typography variant="caption" color={userRoles.length > 0 ? 'success.main' : 'text.secondary'}>
                      {userRoles.length > 0
                        ? 'Roles selected - save changes to update access.'
                        : 'Select at least one role to keep the user aligned with access policies.'}
                    </Typography>
                  </Stack>
                </Paper>
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
