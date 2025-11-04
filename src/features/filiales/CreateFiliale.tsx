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
        Create Filiale
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
                    defaultChecked
                  />
                }
                label="Active"
              />

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                {isLoading ? (
                  <Button disabled fullWidth>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Creating...
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
                      Create Filiale
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
