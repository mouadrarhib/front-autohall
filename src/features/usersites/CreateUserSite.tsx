// src/features/usersites/CreateUserSite.tsx
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
  FormControlLabel,
  Checkbox,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { usersiteApi } from '../../api/endpoints/usersite.api';
import { groupementApi } from '../../api/endpoints/groupement.api';
import { filialeApi } from '../../api/endpoints/filiale.api';
import { succursaleApi } from '../../api/endpoints/succursale.api';
import type { Groupement } from '../../types/usersite.types';

interface CreateUserSiteFormData {
  idGroupement: number;
  idSite: number;
  active: boolean;
}

export const CreateUserSite: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [groupements, setGroupements] = useState<Groupement[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedGroupement, setSelectedGroupement] = useState<Groupement | null>(null);
  const [loadingSites, setLoadingSites] = useState(false);

  const methods = useForm<CreateUserSiteFormData>({
    defaultValues: {
      idGroupement: 0,
      idSite: 0,
      active: true,
    },
  });

  // Load groupements on mount
  useEffect(() => {
    const loadGroupements = async () => {
      try {
        setLoadingData(true);
        const data = await groupementApi.listGroupements();
        setGroupements(data.filter((g) => g.active));
      } catch (err: any) {
        console.error('Failed to load groupements:', err);
        setError('Failed to load groupements');
      } finally {
        setLoadingData(false);
      }
    };

    loadGroupements();
  }, []);

  // Load sites when groupement changes using Filiale/Succursale APIs
  const handleGroupementChange = async (groupementId: number) => {
    if (!groupementId) {
      setSites([]);
      setSelectedGroupement(null);
      return;
    }

    const groupement = groupements.find((g) => g.id === groupementId);
    setSelectedGroupement(groupement || null);

    try {
      setLoadingSites(true);
      console.log('Loading sites for groupement:', groupement?.name);

      if (groupement?.name === 'Filiale') {
        // Fetch filiales
        const response = await filialeApi.listFiliales({ page: 1, pageSize: 100 });
        console.log('Filiales response:', response);
        
        // Filter active filiales
        const activeFiliales = response.data.filter((f) => f.active);
        setSites(activeFiliales);
      } else if (groupement?.name === 'Succursale') {
        // Fetch succursales (only active)
        const response = await succursaleApi.listSuccursales({ 
          onlyActive: true, 
          page: 1, 
          pageSize: 100 
        });
        console.log('Succursales response:', response);
        
        setSites(response.data);
      } else {
        setSites([]);
      }
    } catch (err: any) {
      console.error('Failed to load sites:', err);
      setError(err.response?.data?.error || 'Failed to load sites');
      setSites([]);
    } finally {
      setLoadingSites(false);
    }
  };

  const onSubmit = async (data: CreateUserSiteFormData) => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('Creating user site:', data);
      await usersiteApi.createUserSite(data);
      navigate('/user-sites');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create user site');
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
          onClick={() => navigate('/user-sites')}
          disabled={isLoading}
        >
          Back
        </Button>
        <Typography variant="h4">Create User Site</Typography>
      </Box>

      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Controller
                name="idGroupement"
                control={methods.control}
                rules={{ required: 'Groupement is required', min: 1 }}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth margin="normal" error={!!fieldState.error}>
                    <InputLabel>Groupement Type</InputLabel>
                    <Select
                      {...field}
                      label="Groupement Type"
                      disabled={isLoading}
                      onChange={(e) => {
                        field.onChange(e);
                        handleGroupementChange(Number(e.target.value));
                        methods.setValue('idSite', 0); // Reset site selection
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
                    <FormHelperText>
                      Select either Filiale or Succursale
                    </FormHelperText>
                  </FormControl>
                )}
              />

              <Controller
                name="idSite"
                control={methods.control}
                rules={{ required: 'Site is required', min: 1 }}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth margin="normal" error={!!fieldState.error}>
                    <InputLabel>Site</InputLabel>
                    <Select
                      {...field}
                      label="Site"
                      disabled={isLoading || loadingSites || sites.length === 0}
                    >
                      <MenuItem value={0}>
                        {loadingSites
                          ? 'Loading sites...'
                          : sites.length === 0
                          ? 'Select Type First'
                          : 'Select Site'}
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
                    {selectedGroupement && sites.length > 0 && (
                      <FormHelperText>
                        Type: {selectedGroupement.name} ({sites.length} available)
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              <FormControlLabel
                control={
                  <Checkbox {...methods.register('active')} defaultChecked disabled={isLoading} />
                }
                label="Active"
              />

              <Box display="flex" gap={2} mt={3}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  fullWidth
                  startIcon={
                    isLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                >
                  {isLoading ? 'Creating...' : 'Create User Site'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/user-sites')}
                  fullWidth
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </Box>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </Box>
  );
};
