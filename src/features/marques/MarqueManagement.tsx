// src/features/marques/MarqueManagement.tsx
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

import { filialeApi, type Filiale } from '../../api/endpoints/filiale.api';
import { marqueApi, type Marque } from '../../api/endpoints/marque.api';
import { useAuthStore } from '../../store/authStore';

interface PaginationState {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

interface MarqueFormState {
  name: string;
  idFiliale: number | null;
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

export const MarqueManagement: React.FC = () => {
  const hasCreate = useAuthStore((state) => state.hasPermission('MARQUE_CREATE'));
  const hasUpdate = useAuthStore((state) => state.hasPermission('MARQUE_UPDATE'));

  const [filiales, setFiliales] = useState<Filiale[]>([]);
  const [filialesLoading, setFilialesLoading] = useState(false);
  const [filialesError, setFilialesError] = useState<string | null>(null);

  const [marques, setMarques] = useState<Marque[]>([]);
  const [marquesLoading, setMarquesLoading] = useState(false);
  const [marquesError, setMarquesError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [pageState, setPageState] = useState({ page: 1, pageSize: 10 });
  const [filterFilialeId, setFilterFilialeId] = useState<number | 'all'>('all');
  const [reloadToken, setReloadToken] = useState(0);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('create');
  const [currentMarque, setCurrentMarque] = useState<Marque | null>(null);
  const [formState, setFormState] = useState<MarqueFormState>({
    name: '',
    idFiliale: null,
    imageUrl: '',
    active: true,
  });
  const [saving, setSaving] = useState(false);

  const loadFiliales = useCallback(async () => {
    try {
      setFilialesLoading(true);
      setFilialesError(null);
      const response = await filialeApi.listFiliales({ active: true, page: 1, pageSize: 500 });
      setFiliales(response.data ?? []);
    } catch (err: any) {
      console.error('Failed to load filiales', err);
      setFilialesError(err?.response?.data?.error ?? 'Impossible de charger les filiales.');
    } finally {
      setFilialesLoading(false);
    }
  }, []);

  const filialeNameMap = useMemo(
    () =>
      filiales.reduce<Record<number, string>>((map, filiale) => {
        map[filiale.id] = filiale.name;
        return map;
      }, {}),
    [filiales]
  );

  const loadMarques = useCallback(async () => {
    try {
      setMarquesLoading(true);
      setMarquesError(null);

      const response = await marqueApi.list({
        page: pageState.page,
        pageSize: pageState.pageSize,
        onlyActive: false,
        idFiliale: filterFilialeId === 'all' ? undefined : filterFilialeId,
      });

      const enriched = (response.data ?? []).map((marque) => ({
        ...marque,
        filialeName: marque.filialeName ?? filialeNameMap[marque.idFiliale] ?? 'N/A',
      }));

      setMarques(enriched);
      setPagination({
        page: response.pagination?.page ?? pageState.page,
        pageSize: response.pagination?.pageSize ?? pageState.pageSize,
        totalRecords: response.pagination?.totalRecords ?? enriched.length,
        totalPages: response.pagination?.totalPages ?? 1,
      });
    } catch (err: any) {
      console.error('Failed to load marques', err);
      setMarquesError(err?.response?.data?.error ?? 'Impossible de charger les marques.');
      setMarques([]);
      setPagination((prev) => ({ ...prev, totalRecords: 0, totalPages: 0 }));
    } finally {
      setMarquesLoading(false);
    }
  }, [filterFilialeId, filialeNameMap, pageState.page, pageState.pageSize, reloadToken]);

  useEffect(() => {
    loadFiliales();
  }, [loadFiliales]);

  useEffect(() => {
    loadMarques();
  }, [loadMarques]);

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPageState({
      page: model.page + 1,
      pageSize: model.pageSize,
    });
  };

  const handleOpenDialog = (mode: DialogMode, marque?: Marque) => {
    setDialogMode(mode);
    setCurrentMarque(marque ?? null);
    if (mode === 'edit' && marque) {
      setFormState({
        name: marque.name,
        idFiliale: marque.idFiliale ?? null,
        imageUrl: marque.imageUrl ?? '',
        active: marque.active,
      });
    } else {
      setFormState({
        name: '',
        idFiliale: null,
        imageUrl: '',
        active: true,
      });
    }
    setMarquesError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
    setCurrentMarque(null);
  };

  const handleFormChange = <K extends keyof MarqueFormState>(key: K, value: MarqueFormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveMarque = async () => {
    if (!formState.name.trim()) {
      setMarquesError('Le nom de la marque est requis.');
      return;
    }
    if (formState.idFiliale === null) {
      setMarquesError('Veuillez selectionner une filiale.');
      return;
    }

    try {
      setSaving(true);
      if (dialogMode === 'edit' && currentMarque) {
        await marqueApi.update(currentMarque.id, {
          name: formState.name.trim(),
          idFiliale: formState.idFiliale,
          imageUrl: formState.imageUrl || null,
          active: formState.active,
        });
      } else {
        await marqueApi.create({
          name: formState.name.trim(),
          idFiliale: formState.idFiliale,
          imageUrl: formState.imageUrl || null,
          active: formState.active,
        });
        setPageState((prev) => ({ ...prev, page: 1 }));
      }
      setDialogOpen(false);
      setReloadToken((value) => value + 1);
    } catch (err: any) {
      console.error('Failed to save marque', err);
      setMarquesError(err?.response?.data?.error ?? 'Impossible de sauvegarder la marque.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (marque: Marque) => {
    try {
      setTogglingId(marque.id);
      if (marque.active) {
        await marqueApi.deactivate(marque.id);
      } else {
        await marqueApi.activate(marque.id);
      }
      setReloadToken((value) => value + 1);
    } catch (err: any) {
      console.error('Failed to update marque status', err);
      setMarquesError(err?.response?.data?.error ?? "Impossible de mettre a jour l'etat de la marque.");
    } finally {
      setTogglingId(null);
    }
  };

  const columns = useMemo<GridColDef<Marque>[]>(
    () => [
      {
        field: 'marque',
        headerName: 'Marque',
        flex: 1.6,
        align: 'left',
        headerAlign: 'left',
        minWidth: 240,
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
                width: 52,
                height: 52,
                borderRadius: 2,
                objectFit: 'contain',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                p: 0.5,
                boxShadow: '0 6px 14px rgba(15, 23, 42, 0.08)',
              }}
            />
            <Stack spacing={0.3} sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1, fontSize: "1.05rem" }}>
                {row.name}
              </Typography>
            </Stack>
          </Stack>
        ),
      },
      {
        field: 'filialeName',
        headerName: 'Filiale',
        flex: 1,
        minWidth: 180,
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
              label={row.filialeName ?? 'N/A'}
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
        width: 150,
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
        width: 270,
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
                onClick={() => handleOpenDialog('edit', row)}
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
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, minWidth: 120 }}
                disabled={togglingId === row.id}
              >
                {togglingId === row.id
                  ? 'Veuillez patienter...'
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

  const isFormValid =
    formState.name.trim().length > 0 && formState.idFiliale !== null;

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
            Marques
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerez l'ensemble des marques et assignez-les aux filiales concernees.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 2.5, md: 3 },
            border: '1px solid',
            borderColor: alpha('#1e293b', 0.06),
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <Grid container spacing={2.5} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Filiale (optionnel)</InputLabel>
                <Select
                  value={filterFilialeId === 'all' ? '' : filterFilialeId}
                  label="Filiale (optionnel)"
                  onChange={(event) => {
                    const value = event.target.value;
                    setFilterFilialeId(value === '' ? 'all' : Number(value));
                    setPageState((prev) => ({ ...prev, page: 1 }));
                  }}
                  disabled={filialesLoading}
                >
                  <MenuItem value="">Toutes les filiales</MenuItem>
                  {filiales.map((filiale) => (
                    <MenuItem key={filiale.id} value={filiale.id}>
                      {filiale.name}
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
                  label={`${pagination.totalRecords} marque${pagination.totalRecords === 1 ? '' : 's'}`}
                  color="primary"
                  sx={{ fontWeight: 600, borderRadius: 2 }}
                />
                {hasCreate && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('create')}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      boxShadow: '0 12px 28px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    Nouvelle marque
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
          {filialesError && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setFilialesError(null)}>
              {filialesError}
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
          {marquesError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setMarquesError(null)}>
              {marquesError}
            </Alert>
          )}
          <DataGrid
            autoHeight
            rows={marques}
            columns={columns}
            getRowId={(row) => row.id}
            loading={marquesLoading}
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
        onClose={handleCloseDialog}
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
          {dialogMode === 'edit' ? 'Modifier la marque' : 'Nouvelle marque'}
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
            label="Nom de la marque"
            value={formState.name}
            onChange={(event) => handleFormChange('name', event.target.value)}
            fullWidth
            required
            autoFocus
          />
          <FormControl fullWidth required>
            <InputLabel>Filiale</InputLabel>
            <Select
              value={formState.idFiliale ?? ''}
              label="Filiale"
              onChange={(event) =>
                handleFormChange('idFiliale', event.target.value === '' ? null : Number(event.target.value))
              }
              disabled={filialesLoading}
            >
              <MenuItem value="">Selectionner une filiale</MenuItem>
              {filiales.map((filiale) => (
                <MenuItem key={filiale.id} value={filiale.id}>
                  {filiale.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Image URL (optionnel)"
            value={formState.imageUrl}
            onChange={(event) => handleFormChange('imageUrl', event.target.value)}
            fullWidth
            placeholder="https://exemple.com/logo.png"
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
          <Button onClick={handleCloseDialog} disabled={saving}>
            Annuler
          </Button>
          <Button
            onClick={handleSaveMarque}
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
