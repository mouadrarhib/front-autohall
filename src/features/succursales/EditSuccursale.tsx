// src/features/succursales/EditSuccursale.tsx
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
import { succursaleApi } from '../../api/endpoints/succursale.api';

interface EditSuccursaleFormData {
  name: string;
  active: boolean;
}

export const EditSuccursale: React.FC = () => {
  const { succursaleId } = useParams<{ succursaleId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSuccursale, setLoadingSuccursale] = useState(true);

  const methods = useForm<EditSuccursaleFormData>({
    defaultValues: {
      name: '',
      active: true,
    },
  });

  useEffect(() => {
    const loadSuccursale = async () => {
      if (!succursaleId) return;

      try {
        setLoadingSuccursale(true);
        const succursale = await succursaleApi.getSuccursaleById(Number(succursaleId));
        methods.reset({
          name: succursale.name,
          active: succursale.active,
        });
      } catch (err: any) {
        console.error('Failed to load succursale:', err);
        setError(err.response?.data?.error || 'Failed to load succursale');
      } finally {
        setLoadingSuccursale(false);
      }
    };

    loadSuccursale();
  }, [succursaleId, methods]);

  const onSubmit = async (data: EditSuccursaleFormData) => {
    if (!succursaleId) return;

    try {
      setError(null);
      setIsLoading(true);
      await succursaleApi.updateSuccursale(Number(succursaleId), {
        name: data.name.trim(),
        active: data.active,
      });
      navigate('/succursales');
    } catch (err: any) {
      console.error('Failed to update succursale:', err);
      setError(err.response?.data?.error || 'Failed to update succursale');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingSuccursale) {
    return (
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Skeleton variant="rectangular" width={80} height={36} />
          <Skeleton variant="text" width={240} height={40} />
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
          onClick={() => navigate('/succursales')}
          disabled={isLoading}
        >
          Back
        </Button>
        <Typography variant="h4">Edit Succursale</Typography>
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
                label="Succursale Name"
                rules={{
                  required: 'Succursale name is required',
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
                  {isLoading ? 'Updating...' : 'Update Succursale'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/succursales')}
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

