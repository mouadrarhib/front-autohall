// src/features/versions/VersionDialog.tsx

import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  Avatar,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import LayersIcon from '@mui/icons-material/Layers';
import type { Marque } from '../../api/endpoints/marque.api';
import type { Modele } from '../../api/endpoints/modele.api';
import type { DialogMode, VersionFormState } from './versionTypes';

interface VersionDialogProps {
  open: boolean;
  dialogMode: DialogMode;
  formState: VersionFormState;
  marques: Marque[];
  modeles: Modele[];
  saving: boolean;
  isFormValid: boolean;
  onClose: () => void;
  onSave: () => void;
  onChangeField: <K extends keyof VersionFormState>(key: K, value: VersionFormState[K]) => void;
  onSelectMarque: (value: number | null) => void;
}

export const VersionDialog: React.FC<VersionDialogProps> = ({
  open,
  dialogMode,
  formState,
  marques,
  modeles,
  saving,
  isFormValid,
  onClose,
  onSave,
  onChangeField,
  onSelectMarque,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

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
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? alpha('#1e293b', 0.4)
              : alpha('#f8fafc', 0.8),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {dialogMode === 'create' ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'white',
              }}
            >
              <AddIcon />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'warning.main',
                color: 'white',
              }}
            >
              <SaveIcon />
            </Box>
          )}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
              {dialogMode === 'edit' ? 'Modifier la version' : 'Nouvelle version'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {dialogMode === 'create' 
                ? 'Remplissez les informations pour créer une nouvelle version'
                : 'Modifiez les informations de la version'}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={saving}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: alpha('#ef4444', 0.1),
              color: 'error.main',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Stack spacing={3}>
          {/* Version Information Section */}
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 2, 
                fontWeight: 700,
                color: 'primary.main',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <LayersIcon sx={{ fontSize: '1rem' }} />
              Informations de la version
            </Typography>
            
            <Stack spacing={2}>
              <FormControl fullWidth size={isMobile ? 'small' : 'medium'} required>
                <InputLabel>Marque</InputLabel>
                <Select
                  value={formState.idMarque ?? ''}
                  label="Marque"
                  onChange={(event) => {
                    const value = event.target.value === '' ? null : Number(event.target.value);
                    onSelectMarque(value);
                  }}
                  disabled={saving}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">
                    <em>Sélectionner une marque</em>
                  </MenuItem>
                  {marques.map((marque) => (
                    <MenuItem key={marque.id} value={marque.id}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          src={marque.imageUrl || undefined}
                          alt={marque.name}
                          sx={{ width: 28, height: 28, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1) }}
                        >
                          {marque.name?.[0] || 'M'}
                        </Avatar>
                        <Typography variant="body2">{marque.name}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Modèle</InputLabel>
                <Select
                  value={formState.idModele ?? ''}
                  label="Modèle"
                  onChange={(event) =>
                    onChangeField('idModele', event.target.value === '' ? null : Number(event.target.value))
                  }
                  disabled={saving}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">
                    <em>Sélectionner un modèle</em>
                  </MenuItem>
                  {modeles.map((modele) => (
                    <MenuItem key={modele.id} value={modele.id}>
                      {modele.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Nom de la version"
                value={formState.name}
                onChange={(event) => onChangeField('name', event.target.value)}
                fullWidth
                required
                disabled={saving}
                size={isMobile ? 'small' : 'medium'}
                placeholder="Saisir le nom de la version"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Stack>
          </Box>

          {/* Specifications Section */}
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 2, 
                fontWeight: 700,
                color: 'primary.main',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem',
              }}
            >
              Spécifications
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Prix"
                  type="number"
                  value={formState.price}
                  onChange={(event) => onChangeField('price', Number(event.target.value))}
                  fullWidth
                  required
                  disabled={saving}
                  size={isMobile ? 'small' : 'medium'}
                  inputProps={{ min: 0, step: 100 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="TM Direct (%)"
                  type="number"
                  value={formState.tmPercent}
                  onChange={(event) => onChangeField('tmPercent', Number(event.target.value))}
                  fullWidth
                  required
                  disabled={saving}
                  size={isMobile ? 'small' : 'medium'}
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Marge inter groupe (%)"
                  type="number"
                  value={formState.marginPercent}
                  onChange={(event) => onChangeField('marginPercent', Number(event.target.value))}
                  fullWidth
                  required
                  disabled={saving}
                  size={isMobile ? 'small' : 'medium'}
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Status Section */}
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 2, 
                fontWeight: 700,
                color: 'primary.main',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem',
              }}
            >
              Statut
            </Typography>
            
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: formState.active 
                  ? alpha(theme.palette.success.main, 0.3)
                  : alpha(theme.palette.grey[500], 0.3),
                backgroundColor: formState.active
                  ? alpha(theme.palette.success.main, 0.05)
                  : alpha(theme.palette.grey[500], 0.05),
                transition: 'all 0.2s ease',
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={formState.active}
                    onChange={(event) => onChangeField('active', event.target.checked)}
                    disabled={saving}
                    color="success"
                  />
                }
                label={
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formState.active ? 'Version active' : 'Version inactive'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formState.active 
                        ? 'Cette version est actuellement active et visible'
                        : 'Cette version est actuellement inactive'}
                    </Typography>
                  </Box>
                }
                sx={{ m: 0 }}
              />
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={saving}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            borderColor: alpha('#64748b', 0.3),
            color: 'text.secondary',
            '&:hover': {
              borderColor: '#64748b',
              backgroundColor: alpha('#64748b', 0.08),
            },
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : dialogMode === 'create' ? <AddIcon /> : <SaveIcon />}
          disabled={saving || !isFormValid}
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
          {saving ? 'En cours...' : dialogMode === 'edit' ? 'Mettre à jour' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
