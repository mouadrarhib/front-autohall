// src/features/users/CreateUser.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Divider,
  InputAdornment,
  IconButton,
  Stack,
  Paper,
  Chip,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { authApi } from '../../api/endpoints/auth.api';
import { groupementApi } from '../../api/endpoints/groupement.api';
import { roleApi } from '../../api/endpoints/role.api';
import type { Groupement } from '../../types/usersite.types';
import type { Role } from '../../types/role.types';

interface CreateUserFormData {
  username: string;
  full_name: string;
  email: string;
  password: string;
  idGroupement: number;
  idSite: number;
  roles: number[];
  actif: boolean;
}

const steps = ['Informations utilisateur', 'Affectation site', 'Roles'];

export const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  const [groupements, setGroupements] = useState<Groupement[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [selectedGroupement, setSelectedGroupement] = useState<Groupement | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const methods = useForm<CreateUserFormData>({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
      idGroupement: 0,
      idSite: 0,
      roles: [],
      actif: true,
    },
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingData(true);
        setError(null);

        const [groupementsData, rolesData] = await Promise.all([
          groupementApi.listGroupements(),
          roleApi.listRoles(),
        ]);

        console.log('Loaded data:', {
          groupements: groupementsData,
          roles: rolesData,
        });

        setGroupements(groupementsData.filter((g) => g.active));
        setRoles(rolesData.filter((r: Role) => r.active));
      } catch (err: any) {
        console.error('Echec du chargement des donnees initiales:', err);
        setError('Impossible de charger les donnees du formulaire. Merci de recharger la page.');
      } finally {
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, []);

  const handleGroupementChange = async (groupementId: number) => {
    if (!groupementId) {
      setSites([]);
      setSelectedGroupement(null);
      methods.setValue('idSite', 0);
      return;
    }

    const groupement = groupements.find((g) => g.id === groupementId);
    setSelectedGroupement(groupement || null);

    try {
      const availableSites = await authApi.getAvailableSites();
      console.log('Available sites:', availableSites);

      let filteredSites = availableSites;

      if (groupement?.name?.toLowerCase() === 'filiale') {
        filteredSites = availableSites.filter((s: any) => s.type?.toLowerCase() === 'filiale');
      } else if (groupement?.name?.toLowerCase() === 'succursale') {
        filteredSites = availableSites.filter((s: any) => s.type?.toLowerCase() === 'succursale');
      }

      console.log('Filtered sites:', filteredSites);
      setSites(filteredSites);
    } catch (err: any) {
      console.error('Echec du chargement des sites:', err);
      setError('Impossible de charger les sites disponibles');
      setSites([]);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleNext = async () => {
    const values = methods.getValues();

    if (activeStep === 0) {
      if (!values.username || !values.full_name || !values.email || !values.password) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }

      if (values.password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caracteres');
        return;
      }

      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailRegex.test(values.email)) {
        setError('Veuillez saisir une adresse email valide');
        return;
      }
    }

    if (activeStep === 1) {
      if (!values.idGroupement || values.idGroupement === 0) {
        setError('Veuillez selectionner un type de groupement');
        return;
      }

      if (!values.idSite || values.idSite === 0) {
        setError('Veuillez selectionner un site');
        return;
      }
    }

    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      setError(null);
      setIsLoading(true);

      if (selectedRoles.length === 0) {
        setError("Veuillez assigner au moins un role a l utilisateur");
        setIsLoading(false);
        return;
      }

      const groupement = groupements.find((g) => g.id === data.idGroupement);
      const groupementName = (groupement?.name?.toLowerCase() as 'filiale' | 'succursale') || 'filiale';

      const userData = {
        username: data.username.trim(),
        full_name: data.full_name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        idGroupement: data.idGroupement,
        groupement_name: groupementName,
        idSite: data.idSite,
        site_id: data.idSite,
        roles: selectedRoles,
        role_ids: selectedRoles,
        actif: true,
      };

      console.log('Creating user with complete data:', {
        ...userData,
        password: '***hidden***',
      });

      const result = await authApi.createUserComplete(userData);

      console.log('User created successfully:', result);

      navigate('/users', {
        state: {
          message: `Utilisateur "${data.username}" cree avec succes !`,
        },
      });
    } catch (err: any) {
      console.error('Echec de creation utilisateur:', err);

      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Impossible de creer l utilisateur. Veuillez reessayer.";

      setError(errorMessage);

      if (errorMessage.includes('username') || errorMessage.includes('email')) {
        setActiveStep(0);
      } else if (errorMessage.includes('site') || errorMessage.includes('groupement')) {
        setActiveStep(1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={60} />
          <Typography variant="body1" color="text.secondary">
            Chargement des donnees du formulaire...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton
          onClick={() => navigate('/users')}
          disabled={isLoading}
          sx={{
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          Creer un utilisateur
        </Typography>
      </Stack>

      <Card
        elevation={0}
        sx={{ borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              {activeStep === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Informations de base
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Renseignez les informations principales du compte
                    </Typography>
                    <Divider sx={{ mt: 1, mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="username"
                      control={methods.control}
                      rules={{
                        required: "Le nom d utilisateur est obligatoire",
                        minLength: {
                          value: 3,
                          message: 'Le nom d utilisateur doit avoir au moins 3 caracteres',
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Nom d utilisateur"
                          fullWidth
                          required
                          disabled={isLoading}
                          error={!!fieldState.error}
                          helperText={
                            fieldState.error?.message || 'Nom unique pour la connexion'
                          }
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="full_name"
                      control={methods.control}
                      rules={{ required: 'Le nom complet est obligatoire' }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Nom complet"
                          fullWidth
                          required
                          disabled={isLoading}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message || "Nom complet de l utilisateur"}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="email"
                      control={methods.control}
                      rules={{
                        required: "L email est obligatoire",
                        pattern: {
                          value: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
                          message: 'Format email invalide',
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Adresse email"
                          type="email"
                          fullWidth
                          required
                          disabled={isLoading}
                          error={!!fieldState.error}
                          helperText={
                            fieldState.error?.message || "Email de l utilisateur pour les notifications"
                          }
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="password"
                      control={methods.control}
                      rules={{
                        required: 'Le mot de passe est obligatoire',
                        minLength: {
                          value: 6,
                          message: 'Le mot de passe doit contenir au moins 6 caracteres',
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Mot de passe"
                          type={showPassword ? 'text' : 'password'}
                          fullWidth
                          required
                          disabled={isLoading}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message || 'Minimum 6 caracteres'}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              )}

              {activeStep === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Affectation du site
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Assignez l utilisateur a un type de groupement et a un site precis
                    </Typography>
                    <Divider sx={{ mt: 1, mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="idGroupement"
                      control={methods.control}
                      rules={{
                        required: 'Le type de groupement est obligatoire',
                        validate: (value) => value !== 0 || 'Veuillez selectionner un type de groupement',
                      }}
                      render={({ field, fieldState }) => (
                        <FormControl fullWidth error={!!fieldState.error}>
                          <InputLabel>Type de groupement *</InputLabel>
                          <Select
                            {...field}
                            label="Type de groupement *"
                            onChange={(e) => {
                              field.onChange(e);
                              handleGroupementChange(Number(e.target.value));
                            }}
                            disabled={isLoading}
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value={0} disabled>
                              Choisir un type
                            </MenuItem>
                            {groupements.map((groupement) => (
                              <MenuItem key={groupement.id} value={groupement.id}>
                                {groupement.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                          {!fieldState.error && (
                            <FormHelperText>Choisir entre Filiale ou Succursale</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="idSite"
                      control={methods.control}
                      rules={{
                        required: 'Le site est obligatoire',
                        validate: (value) => value !== 0 || 'Veuillez selectionner un site',
                      }}
                      render={({ field, fieldState }) => (
                        <FormControl fullWidth error={!!fieldState.error}>
                          <InputLabel>Site *</InputLabel>
                          <Select
                            {...field}
                            label="Site *"
                            disabled={sites.length === 0 || isLoading}
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value={0} disabled>
                              {sites.length === 0 ? 'Choisir un groupement d abord' : 'Choisir un site'}
                            </MenuItem>
                            {sites.map((site) => (
                              <MenuItem key={site.id} value={site.id}>
                                {site.name} ({site.type})
                              </MenuItem>
                            ))}
                          </Select>
                          {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                          {!fieldState.error && selectedGroupement && (
                            <FormHelperText>
                              Type: {selectedGroupement.name} | Sites disponibles: {sites.length}
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              )}

              {activeStep === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Roles
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Assignez au moins un role pour definir les acces
                    </Typography>
                    <Divider sx={{ mt: 1, mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} md={10} lg={8}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.015),
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            Assigner des roles
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Choisissez les roles qui s appliquent a cet utilisateur
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={`Selectionnes: ${selectedRoles.length}`}
                          color={selectedRoles.length > 0 ? 'primary' : 'default'}
                          variant={selectedRoles.length > 0 ? 'filled' : 'outlined'}
                        />
                      </Stack>
                      <Divider sx={{ my: 2 }} />
                      {roles.length === 0 ? (
                        <Alert severity="info">
                          Aucun role disponible. Contactez un administrateur pour en creer.
                        </Alert>
                      ) : (
                        <Grid container spacing={2}>
                          {roles.map((role) => {
                            const isSelected = selectedRoles.includes(role.id);
                            return (
                              <Grid item xs={12} sm={6} key={role.id}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    height: '100%',
                                    borderColor: isSelected ? 'primary.light' : 'divider',
                                    bgcolor: isSelected
                                      ? (theme) => alpha(theme.palette.primary.main, 0.06)
                                      : 'background.paper',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      borderColor: 'primary.main',
                                      boxShadow: (theme) =>
                                        isSelected
                                          ? '0 8px 18px rgba(37, 99, 235, 0.18)'
                                          : theme.shadows[2],
                                    },
                                  }}
                                >
                                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Stack
                                      direction="row"
                                      alignItems="flex-start"
                                      justifyContent="space-between"
                                      spacing={1}
                                    >
                                      <Box>
                                        <Typography variant="subtitle1" fontWeight={700}>
                                          {role.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          {role.description || 'Aucune description'}
                                        </Typography>
                                      </Box>
                                      {isSelected && <CheckCircleIcon color="primary" fontSize="small" />}
                                    </Stack>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={isSelected}
                                          onChange={() => handleRoleToggle(role.id)}
                                          color="primary"
                                        />
                                      }
                                      label={
                                        <Typography variant="body2" color="text.secondary">
                                          {isSelected ? 'Assigne a cet utilisateur' : 'Assigner ce role'}
                                        </Typography>
                                      }
                                      sx={{ m: 0, alignItems: 'flex-start' }}
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            );
                          })}
                        </Grid>
                      )}

                      <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        {selectedRoles.length > 0 && <CheckCircleIcon color="success" fontSize="small" />}
                        <Typography
                          variant="caption"
                          color={selectedRoles.length > 0 ? 'success.main' : 'text.secondary'}
                        >
                          {selectedRoles.length > 0
                            ? 'Parfait - les roles definiront les autorisations par defaut.'
                            : 'Selectionnez au moins un role avant de creer le compte.'}
                        </Typography>
                      </Box>
                      {selectedRoles.length === 0 && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          Aucun role selectionne. Choisissez au moins un role pour continuer.
                        </Alert>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              )}

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 4,
                  pt: 3,
                  borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box>
                  {activeStep > 0 && (
                    <Button
                      onClick={handleBack}
                      disabled={isLoading}
                      sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                    >
                      Retour
                    </Button>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    onClick={() => navigate('/users')}
                    disabled={isLoading}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                  >
                    Annuler
                  </Button>

                  {activeStep === steps.length - 1 ? (
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={
                        isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />
                      }
                      disabled={isLoading || selectedRoles.length === 0}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 4,
                        boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)',
                        '&:hover': {
                          boxShadow: '0 12px 24px rgba(37, 99, 235, 0.4)',
                        },
                      }}
                    >
                      {isLoading ? 'Creation...' : 'Creer l utilisateur'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      variant="contained"
                      disabled={isLoading}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 4,
                        fontWeight: 600,
                      }}
                    >
                      Suivant
                    </Button>
                  )}
                </Box>
              </Box>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </Box>
  );
};
