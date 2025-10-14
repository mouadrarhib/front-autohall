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
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Skeleton variant="rectangular" width={80} height={36} />
          <Skeleton variant="text" width={220} height={40} />
        </Box>
        <Card sx={{ maxWidth: 600 }}>
          <CardContent>
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
          onClick={() => navigate('/filiales')}
          disabled={isLoading}
        >
          Back
        </Button>
        <Typography variant="h4">Edit Filiale</Typography>
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
              <FormInput
                name="name"
                label="Filiale Name"
                rules={{
                  required: 'Filiale name is required',
                  minLength: {
                    value: 3,
                    message: 'Name must be at least 3 characters',
                  },
                }}
                disabled={isLoading}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    {...methods.register('active')}
                    disabled={isLoading}
                  />
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
                  {isLoading ? 'Updating...' : 'Update Filiale'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/filiales')}
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

