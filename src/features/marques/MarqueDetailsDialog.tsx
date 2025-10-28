// src/features/marques/MarqueDetailsDialog.tsx

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
import BusinessIcon from '@mui/icons-material/Business';
import ImageIcon from '@mui/icons-material/Image';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import type { Marque } from '../../api/endpoints/marque.api';

interface MarqueDetailsDialogProps {
  open: boolean;
  marque: Marque | null;
  onClose: () => void;
}

export const MarqueDetailsDialog: React.FC<MarqueDetailsDialogProps> = ({
  open,
  marque,
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

  if (!marque) return null;

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
              Détails de la Marque
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
          {/* Brand Information Section */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="primary"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <DirectionsCarIcon fontSize="small" />
              Informations de la Marque
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {/* Brand Logo */}
              <Grid item xs={12} sm={4}>
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Logo
                  </Typography>
                  <Box
                    component="img"
                    src={marque.imageUrl || '/placeholder-brand.png'}
                    alt={marque.name}
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.onerror = null;
                      img.src = '/placeholder-brand.png';
                    }}
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: 2,
                      objectFit: 'contain',
                      border: '2px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      p: 2,
                    }}
                  />
                </Stack>
              </Grid>

              {/* Brand Details */}
              <Grid item xs={12} sm={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Nom de la Marque
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {marque.name}
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
                          label={marque.active ? 'Active' : 'Inactive'}
                          size="small"
                          color={marque.active ? 'success' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>

          {/* Filiale Section */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="primary"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <BusinessIcon fontSize="small" />
              Filiale
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Nom de la Filiale
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {marque.filialeName || 'N/A'}
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
                    {marque.averageSalePrice !== undefined && marque.averageSalePrice !== null
                      ? currencyFormatter.format(marque.averageSalePrice)
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
                    {formatPercent(marque.tmDirect)}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    TM InterGroupe
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="secondary.main">
                    {formatPercent(marque.tmInterGroupe)}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Additional Info */}
          {marque.imageUrl && (
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
                {marque.imageUrl}
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
