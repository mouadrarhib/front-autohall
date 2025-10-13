// src/features/permissions/CreatePermission.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FormInput } from '../../components/common/FormInput';
import { permissionsApi } from '../../api/endpoints/permissions.api';

interface CreatePermissionFormData {
  name: string;
  active: boolean;
}

export const CreatePermission: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<CreatePermissionFormData>({
    defaultValues: {
      name: '',
      active: true,
    },
  });

  const onSubmit = async (data: CreatePermissionFormData) => {
    try {
      setError(null);
      setIsLoading(true);
      await permissionsApi.createPermission(data);
      navigate('/permissions');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create permission');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/permissions')}
        >
          Back
        </Button>
        <Typography variant="h4">Create New Permission</Typography>
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
                label="Permission Name"
                rules={{
                  required: 'Permission name is required',
                  pattern: {
                    value: /^[A-Z_]+$/,
                    message: 'Use only uppercase letters and underscores',
                  },
                }}
                helperText="Example: VEHICLE_READ, USER_CREATE"
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

              <Box display="flex" gap={2} mt={3}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  fullWidth
                >
                  {isLoading ? 'Creating...' : 'Create Permission'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/permissions')}
                  fullWidth
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
