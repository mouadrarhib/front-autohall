// src/features/sites/SiteDialog.tsx

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
  FormControlLabel,
  IconButton,
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
import StorefrontIcon from '@mui/icons-material/Storefront';
import type { DialogMode, SiteFormState, SiteType } from './siteTypes';

interface SiteDialogProps {
  open: boolean;
  dialogMode: DialogMode;
  siteType: SiteType;
  formState: SiteFormState;
  saving: boolean;
  isFormValid: boolean;
  onClose: () => void;
  onSave: () => void;
  onChangeField: <K extends keyof SiteFormState>(key: K, value: SiteFormState[K]) => void;
}

export const SiteDialog: React.FC<SiteDialogProps> = ({
  open,
  dialogMode,
  siteType,
  formState,
  saving,
  isFormValid,
  onClose,
  onSave,
  onChangeField,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const title = dialogMode === 'edit'
    ? `Modifier ${siteType === 'filiale' ? 'la filiale' : 'la succursale'}`
    : `Nouvelle ${siteType === 'filiale' ? 'filiale' : 'succursale'}`;

  const subtitle = dialogMode === 'edit'
    ? `Modifiez les informations de ${siteType === 'filiale' ? 'la filiale' : 'la succursale'}`
    : `Remplissez les informations pour créer ${siteType === 'filiale' ? 'une nouvelle filiale' : 'une nouvelle succursale'}`;

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
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
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
          {/* Site Information Section */}
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
              <StorefrontIcon sx={{ fontSize: '1rem' }} />
              Informations du site
            </Typography>
            
            <TextField
              label={`Nom ${siteType === 'filiale' ? 'de la filiale' : 'de la succursale'}`}
              value={formState.name}
              onChange={(event) => onChangeField('name', event.target.value)}
              fullWidth
              required
              autoFocus
              disabled={saving}
              size={isMobile ? 'small' : 'medium'}
              placeholder={`Saisir le nom ${siteType === 'filiale' ? 'de la filiale' : 'de la succursale'}`}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
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
                      {formState.active ? 'Site actif' : 'Site inactif'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formState.active 
                        ? 'Ce site est actuellement actif et visible'
                        : 'Ce site est actuellement inactif'}
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
