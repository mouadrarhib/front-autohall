// src/features/filiales/EditFiliale.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Skeleton,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { FormInput } from '../../components/common/FormInput';
import { filialeApi } from '../../api/endpoints/filiale.api';

interface EditFilialeFormData {
  name: string;
  active: boolean;
}

export const EditFiliale: React.FC = () => {
  const { filialeId } = useParams<{ filialeId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFiliale, setLoadingFiliale] = useState(true);

  const methods = useForm<EditFilialeFormData>({
    defaultValues: {
      name: '',
      active: true,
    },
  });

  useEffect(() => {
    const loadFiliale = async () => {
      if (!filialeId) return;

      try {
        setLoadingFiliale(true);
        const filiale = await filialeApi.getFilialeById(Number(filialeId));

        methods.reset({
          name: filiale.name,
          active: filiale.active,
        });
      } catch (err: any) {
        console.error('Failed to load filiale:', err);
        setError(err.response?.data?.error || 'Failed to load filiale');
      } finally {
        setLoadingFiliale(false);
      }
    };

    loadFiliale();
  }, [filialeId, methods]);

  const onSubmit = async (data: EditFilialeFormData) => {
    if (!filialeId) return;

    try {
      setError(null);
      setIsLoading(true);

      await filialeApi.updateFiliale(Number(filialeId), {
        name: data.name.trim(),
        active: data.active,
      });

      navigate('/filiales');
    } catch (err: any) {
      console.error('Failed to update filiale:', err);
      setError(err.response?.data?.error || 'Failed to update filiale');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingFiliale) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/filiales')}
        disabled={isLoading}
        sx={{ mb: 2, textTransform: 'none' }}
      >
        Back
      </Button>

      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
        Edit Filiale
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <FormInput
                name="name"
                label="Filiale Name"
                placeholder="Enter filiale name"
                required
                fullWidth
              />

              <FormControlLabel
                control={
                  <Checkbox
                    {...methods.register('active')}
                  />
                }
                label="Active"
              />

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                {isLoading ? (
                  <Button disabled fullWidth>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Updating...
                  </Button>
                ) : (
                  <>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      fullWidth
                      sx={{ textTransform: 'none' }}
                    >
                      Update Filiale
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/filiales')}
                      fullWidth
                      disabled={isLoading}
                      sx={{ textTransform: 'none' }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </Box>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </Box>
  );
};
