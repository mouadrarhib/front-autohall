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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { authApi } from '../../api/endpoints/auth.api';

interface Site {
  id: number;
  name: string;
  type: string;
  active: boolean;
}

export const EditUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Password dialog states
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    idUserSite: 0,
    actif: true,
  });

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // Load user data
      const userData = await authApi.getUserCompleteInfo(Number(userId));
      setUser(userData);

      // Set form data with proper field mapping
      setFormData({
        username: userData.Username || userData.username || '',
        fullName: userData.FullName || userData.full_name || '',
        email: userData.Email || userData.email || '',
        idUserSite: userData.UserSiteId || userData.idUserSite || 0,
        actif: userData.UserActive !== undefined ? userData.UserActive : userData.actif,
      });

      // Load available sites
      const sitesData = await authApi.getAvailableSites();
      setSites(sitesData || []);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.response?.data?.error || 'Failed to load user information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      console.log('Updating user with data:', {
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        idUserSite: formData.idUserSite,
        actif: formData.actif,
      });

      // Update user information
      await authApi.updateUser(Number(userId), {
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        idUserSite: formData.idUserSite,
        actif: formData.actif,
      });

      setSuccessMessage('User updated successfully!');

      // Reload user data to show updated information
      await loadData();

      // Navigate back to users list after showing success message
      setTimeout(() => {
        navigate('/users'); // Fixed: navigate to /users instead of /users/${userId}
      }, 1500);
    } catch (err: any) {
      console.error('Failed to update user:', err);
      setError(err.response?.data?.error || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!userId) return;

    // Validate passwords
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
      
      setSuccessMessage('Password updated successfully!');
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

  const handleToggleActive = async () => {
    if (!userId) return;

    try {
      setSaving(true);
      setError(null);

      if (formData.actif) {
        await authApi.deactivateUser(Number(userId));
        setFormData({ ...formData, actif: false });
        setSuccessMessage('User deactivated successfully!');
      } else {
        await authApi.activateUser(Number(userId));
        setFormData({ ...formData, actif: true });
        setSuccessMessage('User activated successfully!');
      }

      await loadData();
    } catch (err: any) {
      console.error('Failed to toggle user status:', err);
      setError(err.response?.data?.error || 'Failed to update user status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={200} height={40} />
        </Stack>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="100%" height={60} />
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          User not found
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/users')}
          sx={{ mt: 2 }}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={() => navigate('/users')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={700}>
            Edit User: {formData.username}
          </Typography>
        </Stack>
        <Button
          variant="outlined"
          startIcon={<LockResetIcon />}
          onClick={() => setOpenPasswordDialog(true)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Change Password
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Card elevation={0} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={saving}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  disabled={saving}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={saving}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>

            {/* Site Assignment */}
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              Site Assignment
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Site</InputLabel>
                  <Select
                    value={formData.idUserSite}
                    label="Site"
                    onChange={(e) => setFormData({ ...formData, idUserSite: Number(e.target.value) })}
                    disabled={saving}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value={0}>Select Site</MenuItem>
                    {sites.map((site) => (
                      <MenuItem key={site.id} value={site.id}>
                        {site.name} ({site.type})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Status */}
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              Status
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.actif}
                  onChange={handleToggleActive}
                  disabled={saving}
                  color="success"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {formData.actif ? 'Active' : 'Inactive'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formData.actif
                      ? 'User can log in and access the system'
                      : 'User cannot log in or access the system'}
                  </Typography>
                </Box>
              }
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/users')}
                disabled={saving}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={saving}
                sx={{ 
                  borderRadius: 2, 
                  textTransform: 'none', 
                  fontWeight: 600,
                  boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)',
                  '&:hover': {
                    boxShadow: '0 12px 24px rgba(37, 99, 235, 0.4)',
                  },
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog
        open={openPasswordDialog}
        onClose={() => !changingPassword && setOpenPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            Change Password
          </Typography>
        </DialogTitle>
        <DialogContent>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
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
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
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
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => {
              setOpenPasswordDialog(false);
              setNewPassword('');
              setConfirmPassword('');
              setPasswordError(null);
            }}
            disabled={changingPassword}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={changingPassword}
            startIcon={changingPassword ? <CircularProgress size={20} /> : <LockResetIcon />}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 600 
            }}
          >
            {changingPassword ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
