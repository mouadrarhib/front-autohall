// src/features/modeles/ModeleDetailsDialog.tsx

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
import ImageIcon from '@mui/icons-material/Image';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import type { Modele } from '../../api/endpoints/modele.api';

interface ModeleDetailsDialogProps {
  open: boolean;
  modele: Modele | null;
  onClose: () => void;
}

export const ModeleDetailsDialog: React.FC<ModeleDetailsDialogProps> = ({
  open,
  modele,
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

  if (!modele) return null;

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
              Détails du Modèle
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
          {/* Model Information Section */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="primary"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <DirectionsCarIcon fontSize="small" />
              Informations du Modèle
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {/* Model Image */}
              <Grid item xs={12} sm={4}>
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Image
                  </Typography>
                  <Box
                    component="img"
                    src={modele.imageUrl || '/placeholder-car.png'}
                    alt={modele.name}
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.onerror = null;
                      img.src = '/placeholder-car.png';
                    }}
                    sx={{
                      width: '100%',
                      height: 140,
                      borderRadius: 2,
                      objectFit: 'cover',
                      border: '2px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                    }}
                  />
                </Stack>
              </Grid>

              {/* Model Details */}
              <Grid item xs={12} sm={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Nom du Modèle
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {modele.name}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Statut
                      </Typography>
                      <Box>
                        <Chip
                          label={modele.active ? 'Active' : 'Inactive'}
                          size="small"
                          color={modele.active ? 'success' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>

          {/* Marque Section */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="primary"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <CategoryIcon fontSize="small" />
              Marque
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Nom de la Marque
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {modele.marqueName || 'N/A'}
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
                    Prix de Vente Moyen
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="success.main">
                    {modele.averageSalePrice !== undefined && modele.averageSalePrice !== null
                      ? currencyFormatter.format(modele.averageSalePrice)
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
                    {formatPercent(modele.tmDirect)}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    TM InterGroupe
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="secondary.main">
                    {formatPercent(modele.tmInterGroupe)}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Additional Info */}
          {modele.imageUrl && (
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                color="primary"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <ImageIcon fontSize="small" />
                URL de l'Image
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  wordBreak: 'break-all',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                  p: 1.5,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                }}
              >
                {modele.imageUrl}
              </Typography>
            </Box>
          )}
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
