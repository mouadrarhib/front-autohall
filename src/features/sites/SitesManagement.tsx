// src/features/sites/SitesManagement.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { filialeApi, type Filiale } from '../../api/endpoints/filiale.api';
import { succursaleApi, type Succursale } from '../../api/endpoints/succursale.api';

type SiteType = 'filiale' | 'succursale';

interface ManageDialogState {
  open: boolean;
  type: SiteType | null;
  entityId: number | null;
  name: string;
  active: boolean;
}

const INITIAL_DIALOG_STATE: ManageDialogState = {
  open: false,
  type: null,
  entityId: null,
  name: '',
  active: true,
};

export const SitesManagement: React.FC = () => {
  const [filiales, setFiliales] = useState<Filiale[]>([]);
  const [succursales, setSuccursales] = useState<Succursale[]>([]);
  const [loadingFiliales, setLoadingFiliales] = useState(false);
  const [loadingSuccursales, setLoadingSuccursales] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<{ type: SiteType; id: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<ManageDialogState>(INITIAL_DIALOG_STATE);

  const stats = useMemo(
    () => ({
      filialesTotal: filiales.length,
      filialesActive: filiales.filter((item) => item.active).length,
      succursalesTotal: succursales.length,
      succursalesActive: succursales.filter((item) => item.active).length,
    }),
    [filiales, succursales]
  );

  const loadFiliales = useCallback(async () => {
    try {
      setLoadingFiliales(true);
      const response = await filialeApi.listFiliales({ page: 1, pageSize: 1000 });
      setFiliales(response.data ?? []);
    } catch (err: any) {
      console.error('Failed to load filiales', err);
      setError(err?.response?.data?.error ?? 'Impossible de charger les filiales.');
    } finally {
      setLoadingFiliales(false);
    }
  }, []);

  const loadSuccursales = useCallback(async () => {
    try {
      setLoadingSuccursales(true);
      const response = await succursaleApi.listSuccursales({ page: 1, pageSize: 1000 });
      setSuccursales(response.data ?? []);
    } catch (err: any) {
      console.error('Failed to load succursales', err);
      setError(err?.response?.data?.error ?? 'Impossible de charger les succursales.');
    } finally {
      setLoadingSuccursales(false);
    }
  }, []);

  useEffect(() => {
    loadFiliales();
    loadSuccursales();
  }, [loadFiliales, loadSuccursales]);

  const closeDialog = () => {
    setDialogState(INITIAL_DIALOG_STATE);
    setError(null);
  };

  const openCreateDialog = (type: SiteType) => {
    setDialogState({
      open: true,
      type,
      entityId: null,
      name: '',
      active: true,
    });
    setError(null);
  };

  const openEditDialog = (type: SiteType, entity: Filiale | Succursale) => {
    setDialogState({
      open: true,
      type,
      entityId: entity.id,
      name: entity.name,
      active: entity.active,
    });
    setError(null);
  };

  const handleSave = async () => {
    if (!dialogState.type) {
      return;
    }

    if (!dialogState.name.trim()) {
      setError('Le nom est requis.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: dialogState.name.trim(),
        active: dialogState.active,
      };

      if (dialogState.type === 'filiale') {
        if (dialogState.entityId) {
          await filialeApi.updateFiliale(dialogState.entityId, payload);
        } else {
          await filialeApi.createFiliale(payload);
        }
        await loadFiliales();
      } else {
        if (dialogState.entityId) {
          await succursaleApi.updateSuccursale(dialogState.entityId, payload);
        } else {
          await succursaleApi.createSuccursale(payload);
        }
        await loadSuccursales();
      }

      closeDialog();
    } catch (err: any) {
      console.error('Failed to persist site', err);
      setError(err?.response?.data?.error ?? 'Impossible de sauvegarder les changements.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (type: SiteType, entity: Filiale | Succursale) => {
    try {
      setTogglingId({ type, id: entity.id });

      if (type === 'filiale') {
        if (entity.active) {
          await filialeApi.deactivateFiliale(entity.id);
        } else {
          await filialeApi.activateFiliale(entity.id);
        }
        await loadFiliales();
      } else {
        if (entity.active) {
          await succursaleApi.deactivateSuccursale(entity.id);
        } else {
          await succursaleApi.activateSuccursale(entity.id);
        }
        await loadSuccursales();
      }
    } catch (err: any) {
      console.error('Failed to toggle site', err);
      setError(err?.response?.data?.error ?? "Impossible de mettre a jour l'etat du site.");
    } finally {
      setTogglingId(null);
    }
  };

  const renderSiteList = (
    type: SiteType,
    items: (Filiale | Succursale)[],
    loading: boolean
  ) => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      );
    }

    if (!items.length) {
      return (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Aucun site {type === 'filiale' ? 'filiale' : 'succursale'} pour le moment.
        </Alert>
      );
    }

    return (
      <Stack spacing={1.5}>
        {items.map((item) => {
          const isToggling =
            togglingId?.type === type && togglingId.id === item.id;

          return (
            <Paper
              key={`${type}-${item.id}`}
              elevation={0}
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha('#94a3b8', 0.3),
                backgroundColor: alpha('#0f172a', 0.02),
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Identifiant #{item.id}
                </Typography>
              </Box>
              <Chip
                label={item.active ? 'Active' : 'Inactive'}
                color={item.active ? 'success' : 'default'}
                size="small"
                sx={{ fontWeight: 600 }}
              />
              <Stack direction="row" spacing={1}>
                <IconButton
                  aria-label="Modifier"
                  onClick={() => openEditDialog(type, item)}
                  size="small"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label={item.active ? 'Desactiver' : 'Activer'}
                  onClick={() => handleToggle(type, item)}
                  size="small"
                  disabled={isToggling}
                  color={item.active ? 'error' : 'success'}
                >
                  {isToggling ? (
                    <CircularProgress size={18} />
                  ) : item.active ? (
                    <CancelIcon fontSize="small" />
                  ) : (
                    <CheckCircleIcon fontSize="small" />
                  )}
                </IconButton>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Sites Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administrez vos filiales et succursales, ajoutez de nouveaux sites et
            activez ou desactivez ceux existants.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Chip
            label={`Filiales actives: ${stats.filialesActive}/${stats.filialesTotal}`}
            color="primary"
          />
          <Chip
            label={`Succursales actives: ${stats.succursalesActive}/${stats.succursalesTotal}`}
            color="primary"
          />
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              p: { xs: 2.5, md: 3 },
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
              mb={3}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Filiales
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gerez vos filiales et leur statut.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openCreateDialog('filiale')}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
              >
                Ajouter une filiale
              </Button>
            </Stack>
            {renderSiteList('filiale', filiales, loadingFiliales)}
          </Paper>

          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              p: { xs: 2.5, md: 3 },
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
              mb={3}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Succursales
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gerez vos succursales et leur statut.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openCreateDialog('succursale')}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
              >
                Ajouter une succursale
              </Button>
            </Stack>
            {renderSiteList('succursale', succursales, loadingSuccursales)}
          </Paper>
        </Stack>
      </Stack>

      <Dialog
        open={dialogState.open}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialogState.entityId
            ? `Modifier ${dialogState.type === 'filiale' ? 'la filiale' : 'la succursale'}`
            : `Nouvelle ${dialogState.type === 'filiale' ? 'filiale' : 'succursale'}`}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <TextField
            label={dialogState.type === 'filiale' ? 'Nom de la filiale' : 'Nom de la succursale'}
            value={dialogState.name}
            onChange={(event) =>
              setDialogState((prev) => ({ ...prev, name: event.target.value }))
            }
            fullWidth
            required
            autoFocus
          />
          <FormControlLabel
            control={
              <Switch
                checked={dialogState.active}
                onChange={(event) =>
                  setDialogState((prev) => ({ ...prev, active: event.target.checked }))
                }
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} disabled={saving}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} /> : undefined}
            disabled={saving}
          >
            {dialogState.entityId ? 'Mettre a jour' : 'Creer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
