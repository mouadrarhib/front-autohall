// src/features/usersites/EditUserSite.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Skeleton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { usersiteApi } from '../../api/endpoints/usersite.api';
import { groupementApi } from '../../api/endpoints/groupement.api';
import { authApi } from '../../api/endpoints/auth.api';
import type { Groupement, UserSite } from '../../types/usersite.types';

interface EditUserSiteFormData {
  idGroupement: number;
  idSite: number;
  active: boolean;
}

export const EditUserSite: React.FC = () => {
  const { usersiteId } = useParams<{ usersiteId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [groupements, setGroupements] = useState<Groupement[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedGroupement, setSelectedGroupement] = useState<Groupement | null>(null);
  const [usersite, setUsersite] = useState<UserSite | null>(null);

  const methods = useForm<EditUserSiteFormData>({
    defaultValues: {
      idGroupement: 0,
      idSite: 0,
      active: true,
    },
  });

  // Load existing usersite and groupements
  useEffect(() => {
    const loadData = async () => {
      if (!usersiteId) return;

      try {
        setLoadingData(true);

        // Load usersite data
        const usersiteData = await usersiteApi.getUserSiteById(Number(usersiteId));
        setUsersite(usersiteData);

        // Load groupements
        const groupementsData = await groupementApi.listGroupements();
        setGroupements(groupementsData);

        // Find selected groupement
        const groupement = groupementsData.find((g) => g.id === usersiteData.idGroupement);
        setSelectedGroupement(groupement || null);

        // Load sites for the selected groupement
        if (groupement) {
          const availableSites = await authApi.getAvailableSites();
          if (groupement.name === 'Filiale') {
            setSites(availableSites.filter((s: any) => s.type === 'filiale'));
          } else if (groupement.name === 'Succursale') {
            setSites(availableSites.filter((s: any) => s.type === 'succursale'));
          } else {
            setSites(availableSites);
          }
        }

        // Set form values
        methods.reset({
          idGroupement: usersiteData.idGroupement,
          idSite: usersiteData.idSite,
          active: usersiteData.active,
        });
      } catch (err: any) {
        console.error('Failed to load data:', err);
        setError('Failed to load user site data');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [usersiteId, methods]);

  const handleGroupementChange = async (groupementId: number) => {
    if (!groupementId) {
      setSites([]);
      setSelectedGroupement(null);
      return;
    }

    const groupement = groupements.find((g) => g.id === groupementId);
    setSelectedGroupement(groupement || null);

    try {
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

  const onSubmit = async (data: EditUserSiteFormData) => {
    if (!usersiteId) return;

    try {
      setError(null);
      setIsLoading(true);
      await usersiteApi.updateUserSite(Number(usersiteId), data);
      navigate('/user-sites');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update user site');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Skeleton variant="rectangular" width={80} height={36} />
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        <Card sx={{ maxWidth: 600 }}>
          <CardContent>
            <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={56} />
          </CardContent>
        </Card>
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
        <Typography variant="h4">Edit User Site</Typography>
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
                    <InputLabel>Groupement</InputLabel>
                    <Select
                      {...field}
                      label="Groupement"
                      disabled={isLoading}
                      onChange={(e) => {
                        field.onChange(e);
                        handleGroupementChange(Number(e.target.value));
                        methods.setValue('idSite', 0);
                      }}
                    >
                      <MenuItem value={0}>Select Groupement</MenuItem>
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
                      disabled={isLoading || sites.length === 0}
                    >
                      <MenuItem value={0}>
                        {sites.length === 0 ? 'Select Groupement First' : 'Select Site'}
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

              <FormControlLabel
                control={<Checkbox {...methods.register('active')} disabled={isLoading} />}
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
                  {isLoading ? 'Updating...' : 'Update User Site'}
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
