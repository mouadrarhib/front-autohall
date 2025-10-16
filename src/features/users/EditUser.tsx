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

      // Set form data
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

      // Update user information
      await authApi.updateUser(Number(userId), {
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        idUserSite: formData.idUserSite,
        actif: formData.actif,
      });

      setSuccessMessage('User updated successfully!');
      
      // Reload user data
      await loadData();
      
      // Navigate back after 2 seconds
      setTimeout(() => {
        navigate(`/users/${userId}`);
      }, 2000);
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
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">User not found</Alert>
        <Button
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
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/users')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={600}>
            Edit User: {formData.username}
          </Typography>
        </Box>
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
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required disabled={saving}>
                  <InputLabel>Site Assignment</InputLabel>
                  <Select
                    value={formData.idUserSite}
                    label="Site Assignment"
                    onChange={(e) => setFormData({ ...formData, idUserSite: Number(e.target.value) })}
                  >
                    {sites.map((site) => (
                      <MenuItem key={site.id} value={site.id}>
                        {site.name} ({site.type})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Status */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Status
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
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
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/users/${userId}`)}
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
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
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
