// src/features/marques/MarqueDialog.tsx

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
import type { Filiale } from '../../api/endpoints/filiale.api';
import type { DialogMode, MarqueFormState } from './marqueTypes';

interface MarqueDialogProps {
  open: boolean;
  dialogMode: DialogMode;
  formState: MarqueFormState;
  filiales: Filiale[];
  filialesLoading: boolean;
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
  filialesLoading,
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
        {dialogMode === 'edit' ? 'Modifier la marque' : 'Nouvelle marque'}
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
            <InputLabel>Filiale</InputLabel>
            <Select
              label="Filiale"
              value={formState.idFiliale ?? ''}
              onChange={(event) =>
                onChangeField('idFiliale', event.target.value === '' ? null : Number(event.target.value))
              }
              disabled={filialesLoading}
            >
              <MenuItem value="">
                <em>Selectionner une filiale</em>
              </MenuItem>
              {filiales.map((filiale) => (
                <MenuItem key={filiale.id} value={filiale.id}>
                  {filiale.name}
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
            placeholder="https://exemple.com/logo.png"
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
