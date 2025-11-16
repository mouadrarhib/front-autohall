// src/features/users/CreateUser.tsx

import React, { useState, useEffect } from 'react';
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
  InputAdornment,
  IconButton,
  Stack,
  Paper,
  Chip,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { authApi } from '../../api/endpoints/auth.api';
import { groupementApi } from '../../api/endpoints/groupement.api';
import { roleApi } from '../../api/endpoints/role.api';
import type { Groupement } from '../../types/usersite.types';
import type { Role } from '../../types/role.types';

interface CreateUserFormData {
  username: string;
  full_name: string;
  email: string;
  password: string;
  idGroupement: number;
  idSite: number;
  roles: number[];
  actif: boolean;
}
const steps = ['User Information', 'Site Assignment', 'Roles'];

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

  // Selection states
  const [selectedGroupement, setSelectedGroupement] = useState<Groupement | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
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
      } catch (err: any) {
        console.error('Failed to load initial data:', err);
        setError('Failed to load form data. Please refresh the page.');
      } finally {
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, []);

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
      if (selectedRoles.length === 0) {
        setError('Please assign at least one role to the user');
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
        role_ids: selectedRoles,
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

              {/* Step 3: Roles */}
              {activeStep === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Roles
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Assign at least one role to define user access
                    </Typography>
                    <Divider sx={{ mt: 1, mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} md={10} lg={8}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.015),
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            Assign Roles
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Choose the roles that apply to this user
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={`Selected: ${selectedRoles.length}`}
                          color={selectedRoles.length > 0 ? 'primary' : 'default'}
                          variant={selectedRoles.length > 0 ? 'filled' : 'outlined'}
                        />
                      </Stack>
                      <Divider sx={{ my: 2 }} />
                      {roles.length === 0 ? (
                        <Alert severity="info">No roles available. Contact an administrator to create roles.</Alert>
                      ) : (
                        <Grid container spacing={2}>
                          {roles.map((role) => {
                            const isSelected = selectedRoles.includes(role.id);
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
                                        isSelected
                                          ? '0 8px 18px rgba(37, 99, 235, 0.18)'
                                          : theme.shadows[2],
                                    },
                                  }}
                                >
                                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                                      <Box>
                                        <Typography variant="subtitle1" fontWeight={700}>
                                          {role.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          {role.description || 'No description provided'}
                                        </Typography>
                                      </Box>
                                      {isSelected && <CheckCircleIcon color="primary" fontSize="small" />}
                                    </Stack>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={isSelected}
                                          onChange={() => handleRoleToggle(role.id)}
                                          color="primary"
                                        />
                                      }
                                      label={
                                        <Typography variant="body2" color="text.secondary">
                                          {isSelected ? 'Assigned to this user' : 'Assign this role'}
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

                      <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        {selectedRoles.length > 0 && <CheckCircleIcon color="success" fontSize="small" />}
                        <Typography variant="caption" color={selectedRoles.length > 0 ? 'success.main' : 'text.secondary'}>
                          {selectedRoles.length > 0
                            ? 'Great choice — roles will define the default permissions for this user.'
                            : 'Select at least one role before creating the account.'}
                        </Typography>
                      </Box>
                      {selectedRoles.length === 0 && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          No role selected yet. Choose the appropriate role(s) to proceed.
                        </Alert>
                      )}
                    </Paper>
                  </Grid>
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
                      disabled={isLoading || selectedRoles.length === 0}
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

