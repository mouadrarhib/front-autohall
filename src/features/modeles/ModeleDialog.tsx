// src/features/modeles/ModeleDialog.tsx

import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  CircularProgress,
} from '@mui/material';
import type { Marque } from '../../api/endpoints/marque.api';
import type { DialogMode, ModeleFormState } from './modeleTypes';

interface ModeleDialogProps {
  open: boolean;
  dialogMode: DialogMode;
  formState: ModeleFormState;
  marques: Marque[];
  saving: boolean;
  isFormValid: boolean;
  onClose: () => void;
  onSave: () => void;
  onChangeField: <K extends keyof ModeleFormState>(key: K, value: ModeleFormState[K]) => void;
}

export const ModeleDialog: React.FC<ModeleDialogProps> = ({
  open,
  dialogMode,
  formState,
  marques,
  saving,
  isFormValid,
  onClose,
  onSave,
  onChangeField,
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        {dialogMode === 'edit' ? 'Modifier le modele' : 'Nouveau modele'}
      </DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <TextField
            label="Nom"
            name="name"
            value={formState.name}
            onChange={(event) => onChangeField('name', event.target.value)}
            fullWidth
            required
            autoFocus
          />

          <FormControl fullWidth required>
            <InputLabel>Marque</InputLabel>
            <Select
              label="Marque"
              value={formState.idMarque ?? ''}
              onChange={(event) =>
                onChangeField('idMarque', event.target.value === '' ? null : Number(event.target.value))
              }
            >
              <MenuItem value="">
                <em>Selectionner une marque</em>
              </MenuItem>
              {marques.map((marque) => (
                <MenuItem key={marque.id} value={marque.id}>
                  {marque.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Image URL"
            name="imageUrl"
            value={formState.imageUrl}
            onChange={(event) => onChangeField('imageUrl', event.target.value)}
            fullWidth
            placeholder="https://exemple.com/modele.png"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formState.active}
                onChange={(event) => onChangeField('active', event.target.checked)}
              />
            }
            label="Active"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Annuler
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} /> : undefined}
          disabled={saving || !isFormValid}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {dialogMode === 'edit' ? 'Mettre a jour' : 'Creer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
