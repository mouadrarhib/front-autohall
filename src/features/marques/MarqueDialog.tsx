// src/features/marques/MarqueDialog.tsx

import React, { useState, useEffect } from 'react';
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
  Avatar,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ImageIcon from '@mui/icons-material/Image';
import type { DialogMode, MarqueFormState } from './marqueTypes';
import type { Filiale } from '../../api/endpoints/filiale.api';

interface MarqueDialogProps {
  open: boolean;
  dialogMode: DialogMode;
  formState: MarqueFormState;
  filiales: Filiale[];
  saving: boolean;
  isFormValid: boolean;
  onClose: () => void;
  onSave: () => void;
  onChangeField: <K extends keyof MarqueFormState>(key: K, value: MarqueFormState[K]) => void;
}

export const MarqueDialog: React.FC<MarqueDialogProps> = ({
  open,
  dialogMode,
  formState,
  filiales,
  saving,
  isFormValid,
  onClose,
  onSave,
  onChangeField,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [imageError, setImageError] = useState(false);

  // Reset image error when URL changes
  useEffect(() => {
    setImageError(false);
  }, [formState.imageUrl]);

  const hasValidImage = formState.imageUrl && !imageError;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
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
              {dialogMode === 'create' ? 'Nouvelle Marque' : 'Modifier Marque'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {dialogMode === 'create' 
                ? 'Remplissez les informations pour créer une nouvelle marque'
                : 'Modifiez les informations de la marque'}
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
          {/* Marque Information Section */}
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
              <DirectionsCarIcon sx={{ fontSize: '1rem' }} />
              Informations de la marque
            </Typography>
            
            <Stack spacing={2}>
              <TextField
                label="Nom de la marque"
                value={formState.name}
                onChange={(e) => onChangeField('name', e.target.value)}
                fullWidth
                required
                autoFocus
                disabled={saving}
                size={isMobile ? 'small' : 'medium'}
                placeholder="Saisir le nom de la marque"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <FormControl fullWidth required size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Filiale</InputLabel>
                <Select
                  value={formState.idFiliale || ''}
                  label="Filiale"
                  onChange={(e) => onChangeField('idFiliale', Number(e.target.value))}
                  disabled={saving}
                  sx={{ borderRadius: 2 }}
                >
                  {filiales.map((filiale) => (
                    <MenuItem key={filiale.id} value={filiale.id}>
                      {filiale.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {/* Image Section */}
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
              <ImageIcon sx={{ fontSize: '1rem' }} />
              Image de la marque
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="URL de l'image"
                value={formState.imageUrl || ''}
                onChange={(e) => onChangeField('imageUrl', e.target.value)}
                fullWidth
                disabled={saving}
                size={isMobile ? 'small' : 'medium'}
                placeholder="https://exemple.com/image.png"
                helperText="Optionnel - URL de l'image de la marque"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              {/* Image Preview */}
              {formState.imageUrl && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 3,
                    borderRadius: 2,
                    border: '2px dashed',
                    borderColor: hasValidImage 
                      ? alpha(theme.palette.success.main, 0.3)
                      : alpha(theme.palette.grey[500], 0.3),
                    backgroundColor: hasValidImage
                      ? alpha(theme.palette.success.main, 0.05)
                      : alpha(theme.palette.grey[500], 0.05),
                    minHeight: 200,
                  }}
                >
                  {hasValidImage ? (
                    <Box
                      component="img"
                      src={formState.imageUrl}
                      alt="Aperçu de la marque"
                      onError={() => setImageError(true)}
                      sx={{
                        maxWidth: '100%',
                        maxHeight: 200,
                        objectFit: 'contain',
                        borderRadius: 2,
                      }}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          color: 'error.main',
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        <ImageIcon sx={{ fontSize: 40 }} />
                      </Avatar>
                      <Typography variant="body2" color="error">
                        Image introuvable ou URL invalide
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Stack>
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
                    onChange={(e) => onChangeField('active', e.target.checked)}
                    disabled={saving}
                    color="success"
                  />
                }
                label={
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formState.active ? 'Marque active' : 'Marque inactive'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formState.active 
                        ? 'Cette marque est actuellement active et visible'
                        : 'Cette marque est actuellement inactive'}
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
