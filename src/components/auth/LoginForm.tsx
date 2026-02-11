// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { Alert, Box, Button, Card, CardContent, Divider, InputAdornment, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { LockOutlined, PersonOutline } from '@mui/icons-material';
import { FormInput } from '../common/FormInput';
import { useAuthStore } from '../../store/authStore';
import logo from '../../assets/logo.png';

interface LoginFormData {
  username: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const theme = useTheme();
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
      await login(data.username, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Echec de la connexion. Veuillez verifier vos identifiants.';

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
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(145deg, ${alpha('#0f172a', 0.95)} 0%, ${alpha(
          theme.palette.primary.dark,
          0.9
        )} 55%, ${alpha(theme.palette.primary.main, 0.85)} 100%)`,
        p: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -120,
          left: -120,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: alpha('#ffffff', 0.08),
          filter: 'blur(8px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: -90,
          bottom: -110,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: alpha(theme.palette.primary.light, 0.2),
          filter: 'blur(14px)',
        }}
      />
      <Card
        sx={{
          width: '100%',
          maxWidth: 960,
          borderRadius: 4,
          boxShadow: '0 26px 70px rgba(15, 23, 42, 0.35)',
          border: `1px solid ${alpha('#ffffff', 0.15)}`,
          backdropFilter: 'blur(16px)',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' },
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 5,
            background: `linear-gradient(160deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(
              '#0f172a',
              0.96
            )} 100%)`,
            color: theme.palette.common.white,
          }}
        >
          <Box>
            <Box
              component="img"
              src={logo}
              alt="AutoHall"
              sx={{
                width: 70,
                height: 70,
                borderRadius: '18%',
                objectFit: 'contain',
                bgcolor: theme.palette.common.white,
                p: 1,
                boxShadow: '0 12px 24px rgba(15, 23, 42, 0.35)',
                mb: 3,
              }}
            />
            <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: 0.3, mb: 1.5 }}>
              AutoHall Performance Hub
            </Typography>
            <Typography variant="body1" sx={{ color: alpha('#ffffff', 0.86), maxWidth: 360 }}>
              Suivez vos indicateurs, alignez les objectifs de vente et pilotez vos sites a partir d'un
              espace centralise.
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Divider sx={{ borderColor: alpha('#ffffff', 0.16), mb: 2.5 }} />
            <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.78), mb: 1 }}>
              - Acces securise par role
            </Typography>
            <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.78), mb: 1 }}>
              - Donnees consolidees multi-entites
            </Typography>
            <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.78) }}>
              - Visualisation claire des resultats
            </Typography>
          </Box>
        </Box>

        <CardContent
          sx={{
            p: { xs: 3, sm: 4.5, md: 5 },
            backgroundColor: alpha(theme.palette.background.paper, 0.96),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', md: 'flex-start' },
              gap: 1.2,
              mb: 3,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="AutoHall"
              sx={{
                width: { xs: 64, md: 56 },
                height: { xs: 64, md: 56 },
                borderRadius: '18%',
                boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.24)}`,
                objectFit: 'contain',
                bgcolor: 'common.white',
                p: 1,
                display: { xs: 'block', md: 'none' },
              }}
            />
            <Typography variant="h4" component="h1" fontWeight={700} sx={{ letterSpacing: 0.2 }}>
              Bon retour
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="left"
              sx={{ maxWidth: 420, textAlign: { xs: 'center', md: 'left' } }}
            >
              Connectez-vous pour acceder a votre espace de pilotage AutoHall.
            </Typography>
          </Box>
          <Divider sx={{ mb: 3.2 }} />
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <FormInput
                name="username"
                label="Nom d'utilisateur"
                rules={{ required: "Le nom d'utilisateur est requis" }}
                autoComplete="username"
                placeholder="Entrez votre nom d'utilisateur"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.common.white, 0.88),
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <FormInput
                name="password"
                label="Mot de passe"
                type="password"
                rules={{ required: 'Le mot de passe est requis' }}
                autoComplete="current-password"
                placeholder="Entrez votre mot de passe"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.common.white, 0.88),
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
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
                  mt: 3.2,
                  py: 1.4,
                  borderRadius: 2.2,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
                  ':hover': {
                    boxShadow: `0 16px 30px ${alpha(theme.palette.primary.main, 0.45)}`,
                  },
                }}
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', textAlign: 'center', mt: 2.2 }}
              >
                Connexion chiffree et tracee selon les standards internes AutoHall.
              </Typography>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </Box>
  );
};
