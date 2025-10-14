// src/features/succursales/CreateSuccursale.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { FormInput } from '../../components/common/FormInput';
import { succursaleApi } from '../../api/endpoints/succursale.api';

interface CreateSuccursaleFormData {
  name: string;
  active: boolean;
}

export const CreateSuccursale: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<CreateSuccursaleFormData>({
    defaultValues: {
      name: '',
      active: true,
    },
  });

  const onSubmit = async (data: CreateSuccursaleFormData) => {
    try {
      setError(null);
      setIsLoading(true);
      await succursaleApi.createSuccursale({
        name: data.name.trim(),
        active: data.active,
      });
      navigate('/succursales');
    } catch (err: any) {
      console.error('Failed to create succursale:', err);
      setError(err.response?.data?.error || 'Failed to create succursale');
    } finally {
      setIsLoading(false);
    }
  };

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
        <Typography variant="h4">Create Succursale</Typography>
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
                    defaultChecked
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
                  {isLoading ? 'Creating...' : 'Create Succursale'}
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

