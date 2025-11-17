// src/features/marques/MarqueDetailsDialog.tsx

import React from 'react';
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BusinessIcon from '@mui/icons-material/Business';
import ImageIcon from '@mui/icons-material/Image';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import type { Marque } from '../../api/endpoints/marque.api';
import { CatalogDetailsDialogLayout } from '../../components/dialogs/CatalogDetailsDialogLayout';

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
  const currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0,
  });

  const formatPercent = (value?: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(1)}%`;
  };

  if (!marque) return null;

  return (
    <CatalogDetailsDialogLayout
      open={open}
      onClose={onClose}
      title="Détails de la Marque"
      subtitle="Informations complètes"
      icon={<DirectionsCarIcon />}
      chipLabel={marque.active ? 'Active' : 'Inactive'}
      chipColor={marque.active ? 'success' : 'default'}
    >
      <Stack spacing={3}>
        {/* Brand Information */}
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
            {/* Logo */}
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

            {/* Basic details */}
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
                    <Chip
                      label={marque.active ? 'Active' : 'Inactive'}
                      size="small"
                      color={marque.active ? 'success' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
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
            <Grid item xs={12} sm={8}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Nom de la Filiale
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {marque.filialeName || '—'}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5} alignItems="flex-start">
                <Typography variant="caption" color="text.secondary">
                  Statut Filiale
                </Typography>
                <Chip
                  label={marque.filialeActive ? 'Active' : 'Inactive'}
                  size="small"
                  color={marque.filialeActive ? 'success' : 'default'}
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Performance Section */}
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            color="primary"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <TrendingUpIcon fontSize="small" />
            Performance
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AttachMoneyIcon fontSize="inherit" /> Prix moyen de vente
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {marque.averageSalePrice ? currencyFormatter.format(marque.averageSalePrice) : 'N/A'}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ImageIcon fontSize="inherit" /> Revenue
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {marque.revenue ? currencyFormatter.format(marque.revenue) : 'N/A'}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUpIcon fontSize="inherit" /> TM Direct
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatPercent(marque.tmDirect)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUpIcon fontSize="inherit" /> TM Inter Groupe
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatPercent(marque.tmInterGroupe)}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </CatalogDetailsDialogLayout>
  );
};
