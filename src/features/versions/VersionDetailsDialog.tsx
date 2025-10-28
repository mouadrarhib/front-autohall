// src/features/versions/VersionDetailsDialog.tsx

import React from 'react';
import {
  Box,
  Button,
  Chip,
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
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import type { Version } from '../../api/endpoints/version.api';

interface VersionDetailsDialogProps {
  open: boolean;
  version: Version | null;
  onClose: () => void;
}

export const VersionDetailsDialog: React.FC<VersionDetailsDialogProps> = ({
  open,
  version,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0,
  });

  const formatPercent = (value?: number | null) => {
    if (value === null || value === undefined) return '—';
    return `${value.toFixed(1)}%`;
  };

  if (!version) return null;

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
          bgcolor:
            theme.palette.mode === 'dark'
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
            <DirectionsCarIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Détails de la Version
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

      {/* Dialog Content - FIXED */}
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Version Information Section */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="primary"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <LocalOfferIcon fontSize="small" />
              Informations de la Version
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Nom de la Version
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {version.nom}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Statut
                  </Typography>
                  <Box>
                    <Chip
                      label={version.active ? 'Active' : 'Inactive'}
                      size="small"
                      color={version.active ? 'success' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Stack>
              </Grid>

              {/* {version.volume !== undefined && version.volume !== null && (
                <Grid item xs={12} sm={6}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Volume
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <SpeedIcon fontSize="small" color="action" />
                      <Typography variant="body1" fontWeight={500}>
                        {version.volume}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
              )} */}
            </Grid>
          </Box>

          {/* Marque & Modèle Section */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="primary"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <CategoryIcon fontSize="small" />
              Marque & Modèle
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Marque
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {version.nomMarque || version.nomMarque || 'N/A'}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Modèle
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {version.nomModele || version.nomModele || 'N/A'}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Pricing & Margins Section */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="primary"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <TrendingUpIcon fontSize="small" />
              Prix et Marges
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Prix de Vente
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="success.main">
                    {version.prixDeVente !== undefined && version.prixDeVente !== null
                      ? currencyFormatter.format(version.prixDeVente)
                      : version.prixDeVente !== undefined && version.prixDeVente !== null
                      ? currencyFormatter.format(version.prixDeVente)
                      : '—'}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    TM Direct
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="primary.main">
                    {formatPercent(version.tmDirect ?? version.tmDirect)}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    TM InterGroupe
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="secondary.main">
                    {formatPercent(version.tmInterGroupe ?? version.tmInterGroupe)}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* IDs Section (for reference)
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="primary"
              gutterBottom
            >
              Identifiants
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    ID Version
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {version.id}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    ID Modèle
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {version.idModele || 'N/A'}
                  </Typography>
                </Stack>
              </Grid>

              {version.idMarque && (
                <Grid item xs={12} sm={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      ID Marque
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace">
                      {version.idMarque}
                    </Typography>
                  </Stack>
                </Grid>
              )}
            </Grid>
          </Box> */}
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
