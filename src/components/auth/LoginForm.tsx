// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Typography,
} from '@mui/material';
import {
  LockOutlined,
  PersonOutline,
} from '@mui/icons-material';
import { FormInput } from '../common/FormInput';
import { useAuthStore } from '../../store/authStore';

interface LoginFormData {
  username: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      setIsLoading(true);
      
      console.log('Submitting login form:', { username: data.username });
      await login(data.username, data.password);
      
      console.log('Login successful, navigating to dashboard...');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login form error:', err);
      
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || err.message 
        || 'Login failed. Please check your credentials.';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #2563eb 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 3,
          boxShadow: '0 24px 50px rgba(15, 23, 42, 0.35)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <CardContent sx={{ p: 5 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              mb: 4,
            }}
          >
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 56,
                height: 56,
                boxShadow: 3,
              }}
            >
              AH
            </Avatar>
            <Typography variant="h4" component="h1" fontWeight={600}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Sign in to access your Autohall workspace dashboard.
            </Typography>
          </Box>
          <Divider sx={{ mb: 4 }} />
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <FormInput
                name="username"
                label="Username"
                rules={{ required: 'Username is required' }}
                autoComplete="username"
                placeholder="Enter your username"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <FormInput
                name="password"
                label="Password"
                type="password"
                rules={{ required: 'Password is required' }}
                autoComplete="current-password"
                placeholder="Enter your password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isLoading}
                sx={{
                  mt: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 12px 24px rgba(37, 99, 235, 0.35)',
                  ':hover': {
                    boxShadow: '0 16px 30px rgba(37, 99, 235, 0.45)',
                  },
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </Box>
  );
};
