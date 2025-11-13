// src/features/users/UserDetailsDialog.tsx

import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  Chip,
  Grid,
  useMediaQuery,
  useTheme,
  Avatar,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import type { UserCompleteInfo } from '../../api/endpoints/auth.api';

interface UserDetailsDialogProps {
  open: boolean;
  user: UserCompleteInfo | null;
  loading: boolean;
  onClose: () => void;
}

export const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  open,
  user,
  loading,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          backdropFilter: 'blur(10px)',
          bgcolor:
            theme.palette.mode === 'dark'
              ? alpha('#1e293b', 0.4)
              : alpha('#f8fafc', 0.8),
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              bgcolor: alpha('#fff', 0.2),
              width: 45,
              height: 45,
            }}
          >
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              User Details
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Complete user information
            </Typography>
          </Box>
        </Stack>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'white',
            '&:hover': { bgcolor: alpha('#fff', 0.2) },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* Dialog Content */}
      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={300}
          >
            <CircularProgress />
          </Box>
        ) : user ? (
          <Stack spacing={3}>
            {/* Basic Information Section */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                color="primary"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <PersonIcon fontSize="small" />
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Username
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user.Username}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user.FullName}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body1">{user.Email}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            {/* Site & Groupement Section */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                color="primary"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <BusinessIcon fontSize="small" />
                Site & Groupement
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Groupement Type
                    </Typography>
                    <Chip
                      icon={
                        user.GroupementType?.toLowerCase() === 'filiale' ? (
                          <BusinessIcon />
                        ) : (
                          <StoreIcon />
                        )
                      }
                      label={user.GroupementType || 'N/A'}
                      size="small"
                      color={
                        user.GroupementType?.toLowerCase() === 'filiale'
                          ? 'success'
                          : 'info'
                      }
                      sx={{ fontWeight: 600, width: 'fit-content' }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Site Name
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user.SiteName || 'N/A'}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            {/* Roles & Permissions Section */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                color="primary"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <AdminPanelSettingsIcon fontSize="small" />
                Roles & Permissions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Active Roles
                    </Typography>
                    <Chip
                      label={`${user.ActiveRolesCount} Role(s)`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600, width: 'fit-content' }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Active Permissions
                    </Typography>
                    <Chip
                      label={`${user.ActivePermissionsCount} Permission(s)`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ fontWeight: 600, width: 'fit-content' }}
                    />
                  </Stack>
                </Grid>
                {user.UserRoles && (
                  <Grid item xs={12}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Role Names
                      </Typography>
                      <Typography variant="body2">{user.UserRoles}</Typography>
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Status & Activity Section */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                color="primary"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <CalendarTodayIcon fontSize="small" />
                Status & Activity
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={user.UserStatus}
                      size="small"
                      color={user.UserStatus === 'Active' ? 'success' : 'default'}
                      sx={{ fontWeight: 600, width: 'fit-content' }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body2">
                      {user.UserCreatedAt
                        ? new Date(user.UserCreatedAt).toLocaleDateString()
                        : 'N/A'}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Last Activity
                    </Typography>
                    <Typography variant="body2">
                      {user.LastActivity
                        ? new Date(user.LastActivity).toLocaleString()
                        : 'No recent activity'}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        ) : (
          <Typography color="text.secondary" textAlign="center">
            No user data available
          </Typography>
        )}
      </DialogContent>

      <Divider />

      {/* Dialog Actions */}
      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)',
            '&:hover': {
              boxShadow: '0 12px 24px rgba(37, 99, 235, 0.4)',
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
