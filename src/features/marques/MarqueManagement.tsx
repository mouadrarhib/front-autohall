// src/features/marques/MarqueManagement.tsx

import React, { useCallback, useEffect, useState } from 'react';
import { Box, Stack } from '@mui/material';
import type { GridPaginationModel } from '@mui/x-data-grid';
import { filialeApi, type Filiale } from '../../api/endpoints/filiale.api';
import { marqueApi, type Marque } from '../../api/endpoints/marque.api';
import { useAuthStore } from '../../store/authStore';
import { MarqueFilters } from './MarqueFilters';
import { MarqueTable } from './MarqueTable';
import { MarqueDialog } from './MarqueDialog';
import { MarqueDetailsDialog } from './MarqueDetailsDialog'; // New import
import { useMarqueColumns } from './useMarqueColumns';
import type { DialogMode, MarqueFormState, PaginationState } from './marqueTypes';

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  pageSize: 10,
  totalRecords: 0,
  totalPages: 0,
};

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
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Edit Dialog State
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

  // View Details Dialog State (NEW)
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewMarque, setViewMarque] = useState<Marque | null>(null);

  // Debounce search query (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPageState((prev) => ({ ...prev, page: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadFiliales = useCallback(async () => {
    try {
      setFilialesLoading(true);
      setFilialesError(null);
      const response = await filialeApi.listFiliales({
        active: true,
        page: 1,
        pageSize: 1000,
      });
      setFiliales(response.data ?? []);
    } catch (err: any) {
      console.error('Failed to load filiales', err);
      setFilialesError(err?.response?.data?.error ?? 'Impossible de charger les filiales.');
    } finally {
      setFilialesLoading(false);
    }
  }, []);

  const loadMarques = useCallback(async () => {
    try {
      setMarquesLoading(true);
      setMarquesError(null);

      const hasSearch = Boolean(debouncedSearch.trim());
      const commonParams = {
        onlyActive: false,
        page: pageState.page,
        pageSize: pageState.pageSize,
      };
      const filialeFilter = filterFilialeId === 'all' ? undefined : filterFilialeId;

      const response = hasSearch
        ? await marqueApi.search({
            search: debouncedSearch.trim(),
            idFiliale: filialeFilter,
            ...commonParams,
          })
        : await marqueApi.list({
            idFiliale: filialeFilter,
            ...commonParams,
          });

      const enriched = (response.data ?? []).map((marque) => ({
        ...marque,
        filialeName:
          marque.filialeName ?? filiales.find((f) => f.id === marque.idFiliale)?.name ?? 'N/A',
      }));

      setMarques(enriched);
      setPagination(
        response.pagination ?? {
          page: pageState.page,
          pageSize: pageState.pageSize,
          totalRecords: 0,
          totalPages: 0,
        }
      );
    } catch (err: any) {
      console.error('Failed to load marques', err);
      setMarquesError(err?.response?.data?.error ?? 'Impossible de charger les marques.');
      setMarques([]);
      setPagination((prev) => ({ ...prev, totalRecords: 0, totalPages: 0 }));
    } finally {
      setMarquesLoading(false);
    }
  }, [debouncedSearch, filterFilialeId, filiales, pageState.page, pageState.pageSize, reloadToken]);

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

  // Handle View Details (NEW)
  const handleViewMarque = (marque: Marque) => {
    setViewMarque(marque);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setViewMarque(null);
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
        idFiliale: filterFilialeId === 'all' ? null : filterFilialeId,
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

  const handleFormChange = <K extends keyof MarqueFormState>(
    key: K,
    value: MarqueFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!formState.name.trim()) {
      setMarquesError('Le nom de la marque est requis.');
      return;
    }

    if (formState.idFiliale === null) {
      setMarquesError('Veuillez sélectionner une filiale.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formState.name.trim(),
        idFiliale: formState.idFiliale,
        imageUrl: formState.imageUrl || null,
        active: formState.active,
      };

      if (dialogMode === 'edit' && currentMarque) {
        await marqueApi.update(currentMarque.id, payload);
      } else {
        await marqueApi.create(payload);
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
      console.error('Failed to update marque', err);
      setMarquesError(
        err?.response?.data?.error ?? "Impossible de mettre à jour l'état de la marque."
      );
    } finally {
      setTogglingId(null);
    }
  };

  const columns = useMarqueColumns({
    hasUpdate,
    togglingId,
    onView: handleViewMarque, // NEW
    onEdit: (marque) => handleOpenDialog('edit', marque),
    onToggleActive: handleToggleActive,
  });

  const isFormValid = formState.name.trim().length > 0 && formState.idFiliale !== null;

  const handleFilterChange = (value: number | 'all') => {
    setFilterFilialeId(value);
    setPageState((prev) => ({ ...prev, page: 1 }));
    setReloadToken((prev) => prev + 1);
  };

  return (
    <Box
      sx={{
        p: 3,
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(15,23,42,0.6))'
            : 'linear-gradient(135deg, rgba(248,250,252,0.9), rgba(226,232,240,0.7))',
        borderRadius: 4,
        minHeight: '100%',
      }}
    >
      <Stack spacing={3}>
  {/* Filters - Fixed prop names */}
  <MarqueFilters
    filiales={filiales}
    filialesLoading={filialesLoading}
    filterFilialeId={filterFilialeId}  // Changed from selectedFilialeId
    searchQuery={searchQuery}
    totalRecords={pagination.totalRecords}
    hasCreate={hasCreate}
    error={marquesError}  // Changed from filialesError - this is for the general error display
    onClearError={() => setMarquesError(null)}  // Changed from onClearFilialesError
    onChangeFiliale={handleFilterChange}
    onSearchChange={setSearchQuery}
    onCreate={() => handleOpenDialog('create')}
  />

  {/* Table - Fixed prop names */}
  <MarqueTable
    rows={marques}  // Changed from marques
    columns={columns}
    loading={marquesLoading}
    error={marquesError}
    pagination={pagination}
    onPaginationChange={handlePaginationModelChange}  // Changed from onPaginationModelChange
    onClearError={() => setMarquesError(null)}
  />

  {/* Edit Dialog */}
  <MarqueDialog
    open={dialogOpen}
    dialogMode={dialogMode}
    formState={formState}
    filiales={filiales}
    saving={saving}
    isFormValid={isFormValid}
    onClose={handleCloseDialog}
    onSave={handleSave}
    onChangeField={handleFormChange}
  />

  {/* View Details Dialog (NEW) */}
  <MarqueDetailsDialog
    open={viewDialogOpen}
    marque={viewMarque}
    onClose={handleCloseViewDialog}
  />
</Stack>

    </Box>
  );
};
