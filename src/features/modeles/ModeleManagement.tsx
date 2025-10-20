// src/features/modeles/ModeleManagement.tsx
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
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

import { marqueApi, type Marque } from '../../api/endpoints/marque.api';
import { modeleApi, type Modele } from '../../api/endpoints/modele.api';
import { useAuthStore } from '../../store/authStore';

interface PaginationState {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

interface ModeleFormState {
  name: string;
  idMarque: number | null;
  imageUrl: string;
  active: boolean;
}

type DialogMode = 'create' | 'edit';

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  pageSize: 10,
  totalRecords: 0,
  totalPages: 0,
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export const ModeleManagement: React.FC = () => {
  const hasCreate = useAuthStore((state) => state.hasPermission('MODELE_CREATE'));
  const hasUpdate = useAuthStore((state) => state.hasPermission('MODELE_UPDATE'));

  const [marques, setMarques] = useState<Marque[]>([]);
  const [marquesLoading, setMarquesLoading] = useState(false);
  const [marquesError, setMarquesError] = useState<string | null>(null);

  const [modeles, setModeles] = useState<Modele[]>([]);
  const [modelesLoading, setModelesLoading] = useState(false);
  const [modelesError, setModelesError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [pageState, setPageState] = useState({ page: 1, pageSize: 10 });
  const [filterMarqueId, setFilterMarqueId] = useState<number | 'all'>('all');
  const [reloadToken, setReloadToken] = useState(0);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('create');
  const [currentModele, setCurrentModele] = useState<Modele | null>(null);
  const [formState, setFormState] = useState<ModeleFormState>({
    name: '',
    idMarque: null,
    imageUrl: '',
    active: true,
  });
  const [saving, setSaving] = useState(false);

  const loadMarques = useCallback(async () => {
    try {
      setMarquesLoading(true);
      setMarquesError(null);
      const response = await marqueApi.list({
        onlyActive: true,
        page: 1,
        pageSize: 1000,
      });
      setMarques(response.data ?? []);
    } catch (err: any) {
      console.error('Failed to load marques', err);
      setMarquesError(err?.response?.data?.error ?? 'Impossible de charger les marques.');
    } finally {
      setMarquesLoading(false);
    }
  }, []);

  const loadModeles = useCallback(async () => {
    try {
      setModelesLoading(true);
      setModelesError(null);
      const response = await modeleApi.list({
        idMarque: filterMarqueId === 'all' ? undefined : filterMarqueId,
        onlyActive: false,
        page: pageState.page,
        pageSize: pageState.pageSize,
      });

      const enriched = (response.data ?? []).map((modele) => ({
        ...modele,
        marqueName: modele.marqueName ?? marques.find((m) => m.id === modele.idMarque)?.name ?? 'N/A',
      }));

      setModeles(enriched);
      setPagination({
        page: response.pagination?.page ?? pageState.page,
        pageSize: response.pagination?.pageSize ?? pageState.pageSize,
        totalRecords: response.pagination?.totalRecords ?? enriched.length,
        totalPages: response.pagination?.totalPages ?? 1,
      });
    } catch (err: any) {
      console.error('Failed to load modéles', err);
      setModelesError(err?.response?.data?.error ?? 'Impossible de charger les modeles.');
      setModeles([]);
      setPagination((prev) => ({ ...prev, totalRecords: 0, totalPages: 0 }));
    } finally {
      setModelesLoading(false);
    }
  }, [filterMarqueId, pageState.page, pageState.pageSize, marques, reloadToken]);

  useEffect(() => {
    loadMarques();
  }, [loadMarques]);

  useEffect(() => {
    loadModeles();
  }, [loadModeles]);

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPageState({
      page: model.page + 1,
      pageSize: model.pageSize,
    });
  };

  const openDialog = (mode: DialogMode, modele?: Modele) => {
    setDialogMode(mode);
    setCurrentModele(modele ?? null);
    if (mode === 'edit' && modele) {
      setFormState({
        name: modele.name,
        idMarque: modele.idMarque,
        imageUrl: modele.imageUrl ?? '',
        active: modele.active,
      });
    } else {
      setFormState({
        name: '',
        idMarque: filterMarqueId === 'all' ? null : filterMarqueId,
        imageUrl: '',
        active: true,
      });
    }
    setModelesError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
    setCurrentModele(null);
  };

  const handleFormChange = <K extends keyof ModeleFormState>(key: K, value: ModeleFormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!formState.name.trim()) {
      setModelesError('Le nom du modele est requis.');
      return;
    }
    if (!formState.idMarque) {
      setModelesError('Veuillez selectionner une marque.');
      return;
    }

    try {
      setSaving(true);
      if (dialogMode === 'edit' && currentModele) {
        await modeleApi.update(currentModele.id, {
          name: formState.name.trim(),
          idMarque: formState.idMarque,
          imageUrl: formState.imageUrl || null,
          active: formState.active,
        });
      } else {
        await modeleApi.create({
          name: formState.name.trim(),
          idMarque: formState.idMarque,
          imageUrl: formState.imageUrl || null,
          active: formState.active,
        });
        setPageState((prev) => ({ ...prev, page: 1 }));
      }
      setDialogOpen(false);
      setReloadToken((value) => value + 1);
    } catch (err: any) {
      console.error('Failed to save modele', err);
      setModelesError(err?.response?.data?.error ?? 'Impossible de sauvegarder le modele.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (modele: Modele) => {
    try {
      setTogglingId(modele.id);
      if (modele.active) {
        await modeleApi.deactivate(modele.id);
      } else {
        await modeleApi.activate(modele.id);
      }
      setReloadToken((value) => value + 1);
    } catch (err: any) {
      console.error('Failed to update modele', err);
      setModelesError(err?.response?.data?.error ?? "Impossible de mettre a jour l'etat du modele.");
    } finally {
      setTogglingId(null);
    }
  };

  const columns = useMemo<GridColDef<Modele>[]>(
    () => [
      {
        field: 'modele',
        headerName: 'Modèle',
        flex: 1.4,
        minWidth: 220,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        renderCell: ({ row }) => (
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ minWidth: 0, width: '100%', justifyContent: 'flex-start' }}
          >
            <Box
              component="img"
              src={row.imageUrl ?? ''}
              alt={row.name}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null;
                currentTarget.src = '';
              }}
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                objectFit: 'contain',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                p: 0.5,
              }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1, fontSize: '1.05rem' }}>
              {row.name}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'marqueName',
        headerName: 'Marque',
        flex: 1,
        minWidth: 160,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <Chip
              label={row.marqueName ?? 'N/A'}
              size="small"
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                bgcolor: alpha('#2563eb', 0.15),
                color: '#1d4ed8',
              }}
            />
          </Box>
        ),
      },
      {
        field: 'active',
        headerName: 'Statut',
        width: 140,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <Chip
              label={row.active ? 'Active' : 'Inactive'}
              size="small"
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                bgcolor: row.active ? alpha('#22c55e', 0.15) : alpha('#94a3b8', 0.2),
                color: row.active ? '#15803d' : '#475569',
              }}
            />
          </Box>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 240,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}
          >
            {hasUpdate && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon fontSize="small" />}
                onClick={() => openDialog('edit', row)}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Modifier
              </Button>
            )}
            {hasUpdate && (
              <Button
                variant="contained"
                size="small"
                color={row.active ? 'error' : 'success'}
                onClick={() => handleToggleActive(row)}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, minWidth: 110 }}
                disabled={togglingId === row.id}
              >
                {togglingId === row.id
                  ? 'Patientez...'
                  : row.active
                  ? 'Desactiver'
                  : 'Activer'}
              </Button>
            )}
          </Stack>
        ),
      },
    ],
    [hasUpdate, togglingId]
  );

  const isFormValid = formState.name.trim().length > 0 && formState.idMarque !== null;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(15,23,42,0.6))'
            : 'linear-gradient(135deg, rgba(248,250,252,0.9), rgba(226,232,240,0.7))',
        borderRadius: 4,
        minHeight: '100%',
      }}
    >
      <Stack spacing={3}>
        <Box textAlign="center">
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Modèles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Filtrez vos modèles par marque et maintenez leur statut a jour.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 2.5, md: 3 },
            border: '1px solid',
            borderColor: alpha('#1e293b', 0.05),
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <Grid container spacing={2.5} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Marque (optionnel)</InputLabel>
                <Select
                  value={filterMarqueId === 'all' ? '' : filterMarqueId}
                  label="Marque (optionnel)"
                  onChange={(event) => {
                    const value = event.target.value;
                    setFilterMarqueId(value === '' ? 'all' : Number(value));
                    setPageState((prev) => ({ ...prev, page: 1 }));
                  }}
                  disabled={marquesLoading}
                >
                  <MenuItem value="">Toutes les marques</MenuItem>
                  {marques.map((marque) => (
                    <MenuItem key={marque.id} value={marque.id}>
                      {marque.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                justifyContent="center"
                alignItems="center"
              >
                <Chip
                  label={`${pagination.totalRecords} modele${pagination.totalRecords === 1 ? '' : 's'}`}
                  color="primary"
                  sx={{ fontWeight: 600, borderRadius: 2 }}
                />
                {hasCreate && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => openDialog('create')}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      boxShadow: '0 12px 28px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    Nouveau modele
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
          {marquesError && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setMarquesError(null)}>
              {marquesError}
            </Alert>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 2.5, md: 3 },
            border: '1px solid',
            borderColor: alpha('#1e293b', 0.05),
            boxShadow: '0 22px 48px rgba(15, 23, 42, 0.12)',
            backdropFilter: 'blur(6px)',
          }}
        >
          {modelesError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setModelesError(null)}>
              {modelesError}
            </Alert>
          )}
          <DataGrid
            autoHeight
            rows={modeles}
            columns={columns}
            getRowId={(row) => row.id}
            loading={modelesLoading}
            paginationMode="server"
            paginationModel={{
              page: Math.max(pagination.page - 1, 0),
              pageSize: pagination.pageSize,
            }}
            rowCount={pagination.totalRecords}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            disableColumnMenu
            disableColumnFilter
            disableColumnSelector
            density="comfortable"
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnSeparator': {
                display: 'none',
              },
              '& .MuiDataGrid-row': {
                borderRadius: 3,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 18px 30px rgba(15, 23, 42, 0.14)',
                  backgroundColor: alpha('#2563eb', 0.06),
                },
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid',
                borderColor: alpha('#1e293b', 0.05),
                paddingTop: '14px',
                paddingBottom: '14px',
              },
              '& .MuiDataGrid-columnHeaders': {
                borderBottom: '1px solid',
                borderColor: alpha('#1e293b', 0.1),
                background: alpha('#1d4ed8', 0.1),
              },
            }}
          />
        </Paper>
      </Stack>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        PaperProps={{
          sx: {
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {dialogMode === 'edit' ? 'Modifier le modele' : 'Nouveau modele'}
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pt: 2,
            maxHeight: { xs: '60vh', md: '65vh' },
            overflowY: 'auto',
            pr: 1,
            flexGrow: 1,
          }}
        >
          <TextField
            label="Nom du modele"
            value={formState.name}
            onChange={(event) => handleFormChange('name', event.target.value)}
            fullWidth
            required
            autoFocus
          />
          <FormControl fullWidth required>
            <InputLabel>Marque</InputLabel>
            <Select
              value={formState.idMarque ?? ''}
              label="Marque"
              onChange={(event) =>
                handleFormChange('idMarque', event.target.value === '' ? null : Number(event.target.value))
              }
            >
              {marques.map((marque) => (
                <MenuItem key={marque.id} value={marque.id}>
                  {marque.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Image URL (optionnel)"
            value={formState.imageUrl}
            onChange={(event) => handleFormChange('imageUrl', event.target.value)}
            fullWidth
            placeholder="https://exemple.com/modele.png"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formState.active}
                onChange={(event) => handleFormChange('active', event.target.checked)}
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
            disabled={saving || !isFormValid}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {dialogMode === 'edit' ? 'Mettre a jour' : 'Creer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
