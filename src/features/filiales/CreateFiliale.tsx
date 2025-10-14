// src/features/filiales/CreateFiliale.tsx
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
import { filialeApi } from '../../api/endpoints/filiale.api';

interface CreateFilialeFormData {
  name: string;
  active: boolean;
}

export const CreateFiliale: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<CreateFilialeFormData>({
    defaultValues: {
      name: '',
      active: true,
    },
  });

  const onSubmit = async (data: CreateFilialeFormData) => {
    try {
      setError(null);
      setIsLoading(true);
      await filialeApi.createFiliale({
        name: data.name.trim(),
        active: data.active,
      });
      navigate('/filiales');
    } catch (err: any) {
      console.error('Failed to create filiale:', err);
      setError(err.response?.data?.error || 'Failed to create filiale');
    } finally {
      setIsLoading(false);
    }
  };

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
        <Typography variant="h4">Create Filiale</Typography>
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
                  {isLoading ? 'Creating...' : 'Create Filiale'}
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

