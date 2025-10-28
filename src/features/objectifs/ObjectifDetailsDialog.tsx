// src/features/objectifs/ObjectifDetailsDialog.tsx

import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Avatar,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonIcon from '@mui/icons-material/Person';
import type { ObjectifView } from '../../api/endpoints/objectif.api';

interface ObjectifDetailsDialogProps {
  open: boolean;
  objectif: ObjectifView | null;
  onClose: () => void;
}

export const ObjectifDetailsDialog: React.FC<ObjectifDetailsDialogProps> = ({
  open,
  objectif,
  onClose,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const currencyFormatter = new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formatCurrency = (value?: number | null): string => {
    if (value === null || value === undefined) return '—';
    return currencyFormatter.format(value).replace('MAD', 'DH');
  };

  const formatPercent = (value?: number | null) => {
    if (value === null || value === undefined) return '—';
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatDateTime = (value?: string | null): string => {
    if (!value) return '—';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!objectif) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
              borderRadius: fullScreen ? 0 : 3,
              backdropFilter: 'blur(10px)',
              bgcolor: theme.palette.mode === 'dark'
                  ? alpha('#1e293b', 0.4)
                  : alpha('#f8fafc', 0.8),
          },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              bgcolor: alpha('#fff', 0.2),
              width: 45,
              height: 45,
            }}
          >
            <AssessmentIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Détails de l'Objectif
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Informations complètes
            </Typography>
          </Box>
        </Stack>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'white',
            '&:hover': { bgcolor: alpha('#fff', 0.2) },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* Dialog Content */}
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Période & Site Section */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="primary"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <CalendarTodayIcon fontSize="small" />
              Période & Localisation
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Période
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {objectif.periodeName || '—'}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Type de Période
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {objectif.periodeTypeName || '—'}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Groupement
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {objectif.groupementName || '—'}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Site
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {objectif.SiteName || '—'}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Type d'Objectif Section */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="primary"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <BusinessIcon fontSize="small" />
              Type d'Objectif
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Type de Vente
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {objectif.typeVenteName || '—'}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Type d'Objectif
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {objectif.typeObjectifName || '—'}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Véhicule Section */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="primary"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <DirectionsCarIcon fontSize="small" />
              Véhicule
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Marque
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {objectif.marqueName || '—'}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Modèle
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {objectif.modeleName || '—'}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Version
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {objectif.versionName || '—'}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Objectifs Financiers Section */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="primary"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <TrendingUpIcon fontSize="small" />
              Objectifs Financiers
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Volume
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="info.main">
                    {objectif.volume ?? '—'}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Prix Unitaire
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="warning.main">
                    {formatCurrency(objectif.price)}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    TM Direct
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="primary.main">
                    {formatPercent(objectif.TauxMarge)}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    TM InterGroupe
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="secondary.main">
                    {formatPercent(objectif.MargeInterGroupe)}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Marge
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="error.main">
                    {formatCurrency(objectif.Marge)}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Chiffre d'Affaire Total
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">
                    {formatCurrency(objectif.ChiffreDaffaire)}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Historique Section */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="primary"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <PersonIcon fontSize="small" />
              Historique
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Créé par
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {objectif.createdUserFullName || '—'}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Créé le
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatDateTime(objectif.CreatedAt)}
                  </Typography>
                </Stack>
              </Grid>

              {objectif.updatedUserFullName && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Modifié par
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {objectif.updatedUserFullName}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Modifié le
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatDateTime(objectif.updatedCreatedAt)}
                      </Typography>
                    </Stack>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </Stack>
      </DialogContent>

      <Divider />

      {/* Dialog Actions */}
      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)',
            '&:hover': {
              boxShadow: '0 12px 24px rgba(37, 99, 235, 0.4)',
            },
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
