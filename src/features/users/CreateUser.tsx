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
  Autocomplete,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { authApi } from '../../api/endpoints/auth.api';
import { groupementApi } from '../../api/endpoints/groupement.api';
import { permissionsApi } from '../../api/endpoints/permissions.api';
import type { Groupement } from '../../types/usersite.types';
import type { Permission } from '../../types/permission.types';

interface CreateUserFormData {
  username: string;
  full_name: string;
  email: string;
  password: string;
  idGroupement: number;
  idSite: number;
  permissions: number[];
  actif: boolean;
}

const steps = ['User Information', 'Site Assignment', 'Permissions'];

export const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  
  const [groupements, setGroupements] = useState<Groupement[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedGroupement, setSelectedGroupement] = useState<Groupement | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

  const methods = useForm<CreateUserFormData>({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
      idGroupement: 0,
      idSite: 0,
      permissions: [],
      actif: true,
    },
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingData(true);
        
        // Load groupements and permissions
        const [groupementsData, permissionsData] = await Promise.all([
          groupementApi.listGroupements(),
          permissionsApi.listPermissions({ active: true, pageSize: 1000 }),
        ]);
        
        setGroupements(groupementsData.filter((g) => g.active));
        setPermissions(permissionsData.data || []);
      } catch (err: any) {
        console.error('Failed to load initial data:', err);
        setError('Failed to load form data');
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
      return;
    }

    const groupement = groupements.find((g) => g.id === groupementId);
    setSelectedGroupement(groupement || null);

    try {
      // Get filiales and succursales based on groupement type
      const availableSites = await authApi.getAvailableSites();
      
      if (groupement?.name === 'Filiale') {
        setSites(availableSites.filter((s: any) => s.type === 'filiale'));
      } else if (groupement?.name === 'Succursale') {
        setSites(availableSites.filter((s: any) => s.type === 'succursale'));
      } else {
        setSites(availableSites);
      }
    } catch (err: any) {
      console.error('Failed to load sites:', err);
      setSites([]);
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      setError(null);
      setIsLoading(true);

      // Prepare user data for creation
      const userData = {
        username: data.username,
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        idGroupement: data.idGroupement,
        idSite: data.idSite,
        permissions: selectedPermissions.map(p => p.id),
        actif: true,
      };

      console.log('Creating user with data:', userData);
      await authApi.createUserComplete(userData);
      navigate('/users');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/users')}
          disabled={isLoading}
        >
          Back
        </Button>
        <Typography variant="h4">Create New User</Typography>
      </Box>

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              {/* Step 1: User Information */}
              {activeStep === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="username"
                      control={methods.control}
                      rules={{ required: 'Username is required' }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Username"
                          fullWidth
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          disabled={isLoading}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="full_name"
                      control={methods.control}
                      rules={{ required: 'Full name is required' }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Full Name"
                          fullWidth
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          disabled={isLoading}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="email"
                      control={methods.control}
                      rules={{
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Email"
                          type="email"
                          fullWidth
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          disabled={isLoading}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
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
                          type="password"
                          fullWidth
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          disabled={isLoading}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              )}

              {/* Step 2: Site Assignment */}
              {activeStep === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="idGroupement"
                      control={methods.control}
                      rules={{ required: 'Groupement is required', min: 1 }}
                      render={({ field, fieldState }) => (
                        <FormControl fullWidth error={!!fieldState.error}>
                          <InputLabel>Groupement Type</InputLabel>
                          <Select
                            {...field}
                            label="Groupement Type"
                            disabled={isLoading}
                            onChange={(e) => {
                              field.onChange(e);
                              handleGroupementChange(Number(e.target.value));
                              methods.setValue('idSite', 0);
                            }}
                          >
                            <MenuItem value={0}>Select Type</MenuItem>
                            {groupements.map((groupement) => (
                              <MenuItem key={groupement.id} value={groupement.id}>
                                {groupement.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {fieldState.error && (
                            <FormHelperText>{fieldState.error.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="idSite"
                      control={methods.control}
                      rules={{ required: 'Site is required', min: 1 }}
                      render={({ field, fieldState }) => (
                        <FormControl fullWidth error={!!fieldState.error}>
                          <InputLabel>Site</InputLabel>
                          <Select
                            {...field}
                            label="Site"
                            disabled={isLoading || sites.length === 0}
                          >
                            <MenuItem value={0}>
                              {sites.length === 0 ? 'Select Type First' : 'Select Site'}
                            </MenuItem>
                            {sites.map((site) => (
                              <MenuItem key={site.id} value={site.id}>
                                {site.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {fieldState.error && (
                            <FormHelperText>{fieldState.error.message}</FormHelperText>
                          )}
                          {selectedGroupement && (
                            <FormHelperText>
                              Type: {selectedGroupement.name}
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              )}

              {/* Step 3: Permissions */}
              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Assign Permissions
                  </Typography>
                  <Autocomplete
                    multiple
                    options={permissions}
                    getOptionLabel={(option) => option.name}
                    value={selectedPermissions}
                    onChange={(_, newValue) => setSelectedPermissions(newValue)}
                    disabled={isLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Permissions"
                        placeholder="Search and select permissions..."
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.name}
                          {...getTagProps({ index })}
                          size="small"
                        />
                      ))
                    }
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Selected: {selectedPermissions.length} permissions
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Box display="flex" justifyContent="space-between">
                <Button
                  disabled={activeStep === 0 || isLoading}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/users')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading}
                      startIcon={
                        isLoading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <SaveIcon />
                        )
                      }
                    >
                      {isLoading ? 'Creating...' : 'Create User'}
                    </Button>
                  ) : (
                    <Button variant="contained" onClick={handleNext}>
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
