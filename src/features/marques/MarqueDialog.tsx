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
import UploadFileIcon from '@mui/icons-material/UploadFile';
import type { DialogMode, MarqueFormState } from './marqueTypes';
import type { Filiale } from '../../api/endpoints/filiale.api';
import type { Marque } from '../../api/endpoints/marque.api';

interface MarqueDialogProps {
  open: boolean;
  dialogMode: DialogMode;
  formState: MarqueFormState;
  filiales: Filiale[];
  saving: boolean;
  isFormValid: boolean;
  currentMarque?: Marque | null; // For showing existing image
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
  currentMarque,
  onClose,
  onSave,
  onChangeField,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  const [imageError, setImageError] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Create preview URL when file is selected
  useEffect(() => {
    if (formState.image) {
      const objectUrl = URL.createObjectURL(formState.image);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [formState.image]);

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image valide');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La taille de l'image ne doit pas dépasser 5MB");
        return;
      }
      onChangeField('image', file);
      setImageError(false);
    }
  };

  // Clear file selection
  const handleClearFile = () => {
    onChangeField('image', undefined);
    setImageError(false);
  };

  // Determine which image to display
  const displayImageUrl = previewUrl || (dialogMode === 'edit' ? currentMarque?.imageUrl : null);
  const hasValidImage = displayImageUrl && !imageError;

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
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <DialogTitle
        sx={{
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white',
          pb: 3,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              bgcolor: alpha('#fff', 0.2),
              width: 48,
              height: 48,
            }}
          >
            {dialogMode === 'create' ? (
              <AddIcon sx={{ fontSize: 28 }} />
            ) : (
              <DirectionsCarIcon sx={{ fontSize: 28 }} />
            )}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h5" fontWeight={700}>
              {dialogMode === 'create' ? 'Nouvelle Marque' : 'Modifier Marque'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {dialogMode === 'create'
                ? 'Remplissez les informations pour créer une nouvelle marque'
                : 'Modifiez les informations de la marque'}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            disabled={saving}
            sx={{
              color: 'white',
              '&:hover': {
                bgcolor: alpha('#fff', 0.1),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Stack spacing={3}>
          {/* Marque Information Section */}
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="text.secondary"
              gutterBottom
              sx={{ mb: 2 }}
            >
              Informations de la marque
            </Typography>
            <Stack spacing={2.5}>
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
                  value={formState.idFiliale ?? ''}
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

          <Divider />

          {/* Image Section */}
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="text.secondary"
              gutterBottom
              sx={{ mb: 2 }}
            >
              Image de la marque
            </Typography>
            <Stack spacing={2}>
              {/* File Upload Button */}
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                disabled={saving}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  borderStyle: 'dashed',
                  py: 1.5,
                }}
              >
                {formState.image || displayImageUrl ? "Changer l'image" : 'Télécharger une image'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>

              {/* Show selected file name */}
              {formState.image && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ImageIcon color="primary" />
                    <Typography variant="body2" fontWeight={500}>
                      {formState.image.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({(formState.image.size / 1024).toFixed(1)} KB)
                    </Typography>
                  </Stack>
                  <IconButton size="small" onClick={handleClearFile} disabled={saving}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}

              {/* Image Preview */}
              {displayImageUrl && (
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    textAlign: 'center',
                  }}
                >
                  {hasValidImage ? (
                    <img
                      src={displayImageUrl}
                      alt="Aperçu"
                      onError={() => setImageError(true)}
                      style={{
                        maxWidth: '100%',
                        maxHeight: 200,
                        objectFit: 'contain',
                        borderRadius: 8,
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="error">
                      Image introuvable
                    </Typography>
                  )}
                </Box>
              )}

              <Typography variant="caption" color="text.secondary">
                Formats acceptés: JPG, PNG, WEBP, GIF (max 5MB)
              </Typography>
            </Stack>
          </Box>

          <Divider />

          {/* Status Section */}
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="text.secondary"
              gutterBottom
              sx={{ mb: 1 }}
            >
              Statut
            </Typography>
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
                <Box>
                  <Typography variant="body2" fontWeight={500}>
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
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
        <Button
          onClick={onClose}
          disabled={saving}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          startIcon={
            saving ? (
              <CircularProgress size={18} color="inherit" />
            ) : dialogMode === 'create' ? (
              <AddIcon />
            ) : (
              <SaveIcon />
            )
          }
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
