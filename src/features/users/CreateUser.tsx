// src/features/users/CreateUser.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  ListItemSecondaryAction,
  InputAdornment,
  IconButton,
  Stack,
  Paper,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { authApi } from '../../api/endpoints/auth.api';
import { groupementApi } from '../../api/endpoints/groupement.api';
import { roleApi } from '../../api/endpoints/role.api';
import { rolePermissionApi } from '../../api/endpoints/rolePermission.api';
import { groupPermissions } from '../../utils/permissionGrouping';
import type { Groupement } from '../../types/usersite.types';
import type { Permission } from '../../types/permission.types';
import type { Role } from '../../types/role.types';

interface CreateUserFormData {
  username: string;
  full_name: string;
  email: string;
  password: string;
  idGroupement: number;
  idSite: number;
  roles: number[];
  permissions: number[];
  actif: boolean;
}

const normalizeRolePermission = (raw: any): Permission | null => {
  const id =
    raw?.idPermission ??
    raw?.permissionId ??
    raw?.IdPermission ??
    raw?.permission_id ??
    raw?.id ??
    null;

  if (!id) {
    return null;
  }

  return {
    id,
    name:
      raw?.permissionName ??
      raw?.PermissionName ??
      raw?.name ??
      raw?.permission_name ??
      '',
    active: Boolean(
      raw?.permissionActive ??
        raw?.PermissionActive ??
        raw?.active ??
        raw?.Active ??
        true
    ),
  };
};

const steps = ['User Information', 'Site Assignment', 'Roles & Permissions'];

export const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  // Data states
  const [groupements, setGroupements] = useState<Groupement[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissionsCache, setRolePermissionsCache] = useState<
    Record<number, Permission[]>
  >({});
  const [isLoadingRolePermissions, setIsLoadingRolePermissions] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [permissionSearch, setPermissionSearch] = useState('');

  // Selection states
  const [selectedGroupement, setSelectedGroupement] = useState<Groupement | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const methods = useForm<CreateUserFormData>({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
      idGroupement: 0,
      idSite: 0,
      roles: [],
      permissions: [],
      actif: true,
    },
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingData(true);
        setError(null);

        // Load groupements and roles in parallel
        const [groupementsData, rolesData] = await Promise.all([
          groupementApi.listGroupements(),
          roleApi.listRoles(),
        ]);

        console.log('Loaded data:', {
          groupements: groupementsData,
          roles: rolesData,
        });

        setGroupements(groupementsData.filter((g) => g.active));
        setRoles(rolesData.filter((r: Role) => r.active));
        setPermissions([]);
      } catch (err: any) {
        console.error('Failed to load initial data:', err);
        setError('Failed to load form data. Please refresh the page.');
      } finally {
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (loadingData) {
      return;
    }

    if (selectedRoles.length === 0) {
      setPermissions([]);
      setSelectedPermissions([]);
      setPermissionsError(null);
      setIsLoadingRolePermissions(false);
      return;
    }

    let isCancelled = false;

    const updatePermissionsForRoles = async () => {
      const aggregated = new Map<number, Permission>();

      selectedRoles.forEach((roleId) => {
        const cachedPermissions = rolePermissionsCache[roleId] || [];
        cachedPermissions.forEach((permission) => {
          aggregated.set(permission.id, permission);
        });
      });

      const missingRoleIds = selectedRoles.filter(
        (roleId) => !rolePermissionsCache[roleId]
      );

      if (missingRoleIds.length === 0) {
        const sortedPermissions = Array.from(aggregated.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setPermissions(sortedPermissions);
        setSelectedPermissions((prev) =>
          prev.filter((id) => aggregated.has(id))
        );
        setPermissionsError(null);
        return;
      }

      setIsLoadingRolePermissions(true);
      setPermissionsError(null);

      try {
        const fetched = await Promise.all(
          missingRoleIds.map(async (roleId) => {
            const response = await rolePermissionApi.getPermissionsByRole(
              roleId,
              true
            );
            const normalized = response
              .map(normalizeRolePermission)
              .filter(
                (permission): permission is Permission => Boolean(permission)
              );

            normalized.forEach((permission) => {
              aggregated.set(permission.id, permission);
            });

            return { roleId, permissions: normalized };
          })
        );

        if (isCancelled) {
          return;
        }

        if (fetched.length > 0) {
          setRolePermissionsCache((prev) => {
            const updated = { ...prev };
            fetched.forEach(({ roleId, permissions }) => {
              updated[roleId] = permissions;
            });
            return updated;
          });
        }

        const sortedPermissions = Array.from(aggregated.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setPermissions(sortedPermissions);
        setSelectedPermissions((prev) =>
          prev.filter((id) => aggregated.has(id))
        );
      } catch (err) {
        if (isCancelled) {
          return;
        }

        console.error('Failed to load permissions for selected roles:', err);
        setPermissionsError(
          'Unable to load permissions for the selected roles.'
        );

        const fallbackPermissions = Array.from(aggregated.values()).sort(
          (a, b) => a.name.localeCompare(b.name)
        );
        setPermissions(fallbackPermissions);

        if (aggregated.size > 0) {
          setSelectedPermissions((prev) =>
            prev.filter((id) => aggregated.has(id))
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingRolePermissions(false);
        }
      }
    };

    updatePermissionsForRoles();

    return () => {
      isCancelled = true;
    };
  }, [selectedRoles, rolePermissionsCache, loadingData]);

  useEffect(() => {
    if (selectedRoles.length === 0 && permissionSearch) {
      setPermissionSearch('');
    }
  }, [selectedRoles, permissionSearch]);

  const permissionGroups = useMemo(
    () => groupPermissions(permissions, { searchTerm: permissionSearch }),
    [permissions, permissionSearch]
  );

  const handleGroupementChange = async (groupementId: number) => {
    if (!groupementId) {
      setSites([]);
      setSelectedGroupement(null);
      methods.setValue('idSite', 0);
      return;
    }

    const groupement = groupements.find((g) => g.id === groupementId);
    setSelectedGroupement(groupement || null);

    try {
      // Get available sites based on groupement type
      const availableSites = await authApi.getAvailableSites();
      console.log('Available sites:', availableSites);

      // Filter sites based on groupement type
      let filteredSites = availableSites;
      
      if (groupement?.name?.toLowerCase() === 'filiale') {
        filteredSites = availableSites.filter(
          (s: any) => s.type?.toLowerCase() === 'filiale'
        );
      } else if (groupement?.name?.toLowerCase() === 'succursale') {
        filteredSites = availableSites.filter(
          (s: any) => s.type?.toLowerCase() === 'succursale'
        );
      }

      console.log('Filtered sites:', filteredSites);
      setSites(filteredSites);
    } catch (err: any) {
      console.error('Failed to load sites:', err);
      setError('Failed to load available sites');
      setSites([]);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleNext = async () => {
    // Validate current step before proceeding
    const values = methods.getValues();
    
    if (activeStep === 0) {
      // Validate user information
      if (!values.username || !values.full_name || !values.email || !values.password) {
        setError('Please fill in all required fields');
        return;
      }
      
      if (values.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(values.email)) {
        setError('Please enter a valid email address');
        return;
      }
    }
    
    if (activeStep === 1) {
      // Validate site assignment
      if (!values.idGroupement || values.idGroupement === 0) {
        setError('Please select a groupement type');
        return;
      }
      
      if (!values.idSite || values.idSite === 0) {
        setError('Please select a site');
        return;
      }
    }

    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      setError(null);
      setIsLoading(true);

      // Validate final step
      if (selectedRoles.length === 0 && selectedPermissions.length === 0) {
        setError('Please assign at least one role or permission to the user');
        setIsLoading(false);
        return;
      }

      // Get groupement name for proper backend processing
      const groupement = groupements.find((g) => g.id === data.idGroupement);
      const groupementName = groupement?.name?.toLowerCase() as 'filiale' | 'succursale' || 'filiale';

      // Prepare complete user data
      const userData = {
        username: data.username.trim(),
        full_name: data.full_name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        idGroupement: data.idGroupement,
        groupement_name: groupementName,
        idSite: data.idSite,
        site_id: data.idSite, // Some backends might expect this field
        roles: selectedRoles,
        permissions: selectedPermissions,
        actif: true,
      };

      console.log('Creating user with complete data:', {
        ...userData,
        password: '***hidden***', // Don't log the actual password
      });

      // Call the complete user creation API
      const result = await authApi.createUserComplete(userData);
      
      console.log('User created successfully:', result);

      // Navigate back to users list
      navigate('/users', {
        state: { 
          message: `User "${data.username}" created successfully!` 
        }
      });
    } catch (err: any) {
      console.error('Failed to create user:', err);
      
      // Extract error message from response
      const errorMessage = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        err.message ||
        'Failed to create user. Please try again.';
      
      setError(errorMessage);
      
      // If it's a validation error, go back to the appropriate step
      if (errorMessage.includes('username') || errorMessage.includes('email')) {
        setActiveStep(0);
      } else if (errorMessage.includes('site') || errorMessage.includes('groupement')) {
        setActiveStep(1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={60} />
          <Typography variant="body1" color="text.secondary">
            Loading form data...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton
          onClick={() => navigate('/users')}
          disabled={isLoading}
          sx={{
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          Create New User
        </Typography>
      </Stack>

      <Card elevation={0} sx={{ borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 4 }}>
          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              onClose={() => setError(null)}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              {/* Step 1: User Information */}
              {activeStep === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Basic Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Enter the user's basic account details
                    </Typography>
                    <Divider sx={{ mt: 1, mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="username"
                      control={methods.control}
                      rules={{ 
                        required: 'Username is required',
                        minLength: {
                          value: 3,
                          message: 'Username must be at least 3 characters'
                        }
                      }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Username"
                          fullWidth
                          required
                          disabled={isLoading}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message || 'Unique username for login'}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="full_name"
                      control={methods.control}
                      rules={{ required: 'Full name is required' }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Full Name"
                          fullWidth
                          required
                          disabled={isLoading}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message || 'User\'s complete name'}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="email"
                      control={methods.control}
                      rules={{
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Invalid email format',
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Email Address"
                          type="email"
                          fullWidth
                          required
                          disabled={isLoading}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message || 'User\'s email for notifications'}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="password"
                      control={methods.control}
                      rules={{
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          fullWidth
                          required
                          disabled={isLoading}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message || 'Minimum 6 characters'}
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
                      )}
                    />
                  </Grid>
                </Grid>
              )}

              {/* Step 2: Site Assignment */}
              {activeStep === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Site Assignment
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Assign the user to a groupement type and specific site
                    </Typography>
                    <Divider sx={{ mt: 1, mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="idGroupement"
                      control={methods.control}
                      rules={{ 
                        required: 'Groupement is required',
                        validate: (value) => value !== 0 || 'Please select a groupement type'
                      }}
                      render={({ field, fieldState }) => (
                        <FormControl fullWidth error={!!fieldState.error}>
                          <InputLabel>Groupement Type *</InputLabel>
                          <Select
                            {...field}
                            label="Groupement Type *"
                            onChange={(e) => {
                              field.onChange(e);
                              handleGroupementChange(Number(e.target.value));
                            }}
                            disabled={isLoading}
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value={0} disabled>
                              Select Type
                            </MenuItem>
                            {groupements.map((groupement) => (
                              <MenuItem key={groupement.id} value={groupement.id}>
                                {groupement.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {fieldState.error && (
                            <FormHelperText>{fieldState.error.message}</FormHelperText>
                          )}
                          {!fieldState.error && (
                            <FormHelperText>
                              Choose between Filiale or Succursale
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="idSite"
                      control={methods.control}
                      rules={{ 
                        required: 'Site is required',
                        validate: (value) => value !== 0 || 'Please select a site'
                      }}
                      render={({ field, fieldState }) => (
                        <FormControl fullWidth error={!!fieldState.error}>
                          <InputLabel>Site *</InputLabel>
                          <Select
                            {...field}
                            label="Site *"
                            disabled={sites.length === 0 || isLoading}
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value={0} disabled>
                              {sites.length === 0 ? 'Select Groupement First' : 'Select Site'}
                            </MenuItem>
                            {sites.map((site) => (
                              <MenuItem key={site.id} value={site.id}>
                                {site.name} ({site.type})
                              </MenuItem>
                            ))}
                          </Select>
                          {fieldState.error && (
                            <FormHelperText>{fieldState.error.message}</FormHelperText>
                          )}
                          {!fieldState.error && selectedGroupement && (
                            <FormHelperText>
                              Type: {selectedGroupement.name} | Available sites: {sites.length}
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              )}

              {/* Step 3: Roles & Permissions */}
              {activeStep === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Roles & Permissions
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Assign roles and additional permissions to define user access
                    </Typography>
                    <Divider sx={{ mt: 1, mb: 3 }} />
                  </Grid>

                  {/* Roles Section */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Assign Roles
                      </Typography>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Roles grant predefined sets of permissions
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Box
                        sx={{
                          maxHeight: 300,
                          overflow: 'auto',
                          border: (theme) => `1px solid ${theme.palette.divider}`,
                          borderRadius: 1,
                        }}
                      >
                        <List dense>
                          {roles.length === 0 ? (
                            <ListItem>
                              <ListItemText 
                                primary="No roles available" 
                                secondary="Contact administrator to create roles"
                              />
                            </ListItem>
                          ) : (
                            roles.map((role) => (
                              <ListItem 
                                key={role.id} 
                                button 
                                onClick={() => handleRoleToggle(role.id)}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                  },
                                }}
                              >
                                <ListItemText
                                  primary={role.name}
                                  secondary={role.description || 'No description'}
                                />
                                <ListItemSecondaryAction>
                                  <Checkbox
                                    edge="end"
                                    checked={selectedRoles.includes(role.id)}
                                    onChange={() => handleRoleToggle(role.id)}
                                    color="primary"
                                  />
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))
                          )}
                        </List>
                      </Box>
                      
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        {selectedRoles.length > 0 && <CheckCircleIcon color="success" fontSize="small" />}
                        <Typography variant="caption" color={selectedRoles.length > 0 ? 'success.main' : 'text.secondary'}>
                          Selected: {selectedRoles.length} role(s)
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Permissions Section */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Additional Permissions
                      </Typography>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Grant specific permissions beyond role assignments
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Rechercher une permission..."
                        value={permissionSearch}
                        onChange={(e) => setPermissionSearch(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />

                      <Box
                        sx={{
                          maxHeight: 300,
                            overflow: 'auto',
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            borderRadius: 1,
                          }}
                        >
                          {isLoadingRolePermissions ? (
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                py: 4,
                                gap: 1,
                              }}
                            >
                              <CircularProgress size={24} color="primary" />
                              <Typography variant="body2" color="text.secondary">
                                Loading permissions for the selected role(s)...
                              </Typography>
                            </Box>
                          ) : (
                            <>
                              {permissionsError && (
                                <Alert severity="error" sx={{ m: 2, borderRadius: 1 }}>
                                  {permissionsError}
                                </Alert>
                              )}
                              {selectedRoles.length === 0 ? (
                                <Box sx={{ p: 2 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Select at least one role to view permissions.
                                  </Typography>
                                </Box>
                              ) : permissionGroups.length === 0 ? (
                                <Box sx={{ p: 2 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {permissionSearch
                                      ? 'No permissions match your search.'
                                      : 'No permissions found for the selected role(s).'}
                                  </Typography>
                                </Box>
                              ) : (
                                <Box sx={{ py: 1 }}>
                                  {permissionGroups.map((group) => (
                                    <Box
                                      key={group.resourceKey}
                                      sx={{ '&:not(:last-of-type)': { mb: 1.5 } }}
                                    >
                                      <Box
                                        sx={{
                                          px: 2,
                                          py: 1,
                                          backgroundColor: (theme) =>
                                            alpha(theme.palette.primary.main, 0.05),
                                        }}
                                      >
                                        <Typography
                                          variant="subtitle2"
                                          fontWeight={600}
                                          color="text.primary"
                                        >
                                          {group.resourceLabel}
                                        </Typography>
                                      </Box>
                                      <List dense disablePadding>
                                        {group.items.map(
                                          ({ permission, actionLabel, rawKey }) => (
                                            <ListItem
                                              key={permission.id}
                                              button
                                              onClick={() =>
                                                handlePermissionToggle(permission.id)
                                              }
                                              sx={{
                                                pl: 2,
                                                pr: 1,
                                                '&:hover': {
                                                  backgroundColor: (theme) =>
                                                    alpha(
                                                      theme.palette.primary.main,
                                                      0.08
                                                    ),
                                                },
                                              }}
                                            >
                                      <Tooltip
                                        title={rawKey}
                                        placement="top-start"
                                        arrow
                                      >
                                        <ListItemText primary={actionLabel} />
                                      </Tooltip>
                                              <ListItemSecondaryAction>
                                                <Checkbox
                                                  edge="end"
                                                  checked={selectedPermissions.includes(
                                                    permission.id
                                                  )}
                                                  onChange={() =>
                                                    handlePermissionToggle(permission.id)
                                                  }
                                                  color="primary"
                                                />
                                              </ListItemSecondaryAction>
                                            </ListItem>
                                          )
                                        )}
                                      </List>
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </>
                          )}
                        </Box>
                      
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        {selectedPermissions.length > 0 && <CheckCircleIcon color="success" fontSize="small" />}
                        <Typography variant="caption" color={selectedPermissions.length > 0 ? 'success.main' : 'text.secondary'}>
                          Selected: {selectedPermissions.length} permission(s)
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Summary Alert */}
                  {selectedRoles.length === 0 && selectedPermissions.length === 0 && (
                    <Grid item xs={12}>
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        Please assign at least one role or permission to the user before creating the account.
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              )}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Box>
                  {activeStep > 0 && (
                    <Button
                      onClick={handleBack}
                      disabled={isLoading}
                      sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                    >
                      Back
                    </Button>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    onClick={() => navigate('/users')}
                    disabled={isLoading}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                  >
                    Cancel
                  </Button>
                  
                  {activeStep === steps.length - 1 ? (
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      disabled={isLoading || (selectedRoles.length === 0 && selectedPermissions.length === 0)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 4,
                        boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)',
                        '&:hover': {
                          boxShadow: '0 12px 24px rgba(37, 99, 235, 0.4)',
                        },
                      }}
                    >
                      {isLoading ? 'Creating...' : 'Create User'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      variant="contained"
                      disabled={isLoading}
                      sx={{ 
                        borderRadius: 2, 
                        textTransform: 'none', 
                        px: 4,
                        fontWeight: 600,
                      }}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </Box>
  );
};
