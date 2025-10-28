// src/features/modeles/ModeleManagement.tsx

import React, { useCallback, useEffect, useState } from 'react';
import { Box, Stack } from '@mui/material';
import type { GridPaginationModel } from '@mui/x-data-grid';
import { marqueApi, type Marque } from '../../api/endpoints/marque.api';
import { modeleApi, type Modele } from '../../api/endpoints/modele.api';
import { useAuthStore } from '../../store/authStore';
import { ModeleFilters } from './ModeleFilters';
import { ModeleTable } from './ModeleTable';
import { ModeleDialog } from './ModeleDialog';
import { ModeleDetailsDialog } from './ModeleDetailsDialog'; // NEW
import { useModeleColumns } from './useModeleColumns';
import type { DialogMode, ModeleFormState, PaginationState } from './modeleTypes';

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  pageSize: 10,
  totalRecords: 0,
  totalPages: 0,
};

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
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Edit Dialog State
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

  // View Details Dialog State (NEW)
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewModele, setViewModele] = useState<Modele | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPageState((prev) => ({ ...prev, page: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

      const hasSearch = Boolean(debouncedSearch.trim());
      const commonParams = {
        onlyActive: false,
        page: pageState.page,
        pageSize: pageState.pageSize,
      };
      const marqueFilter = filterMarqueId === 'all' ? undefined : filterMarqueId;

      const response = hasSearch
        ? await modeleApi.search({
            q: debouncedSearch.trim(),
            idMarque: marqueFilter,
            ...commonParams,
          })
        : await modeleApi.list({
            idMarque: marqueFilter,
            ...commonParams,
          });

      setModeles(response.data ?? []);
      setPagination(
        response.pagination ?? {
          page: pageState.page,
          pageSize: pageState.pageSize,
          totalRecords: 0,
          totalPages: 0,
        }
      );
    } catch (err: any) {
      console.error('Failed to load modeles', err);
      setModelesError(err?.response?.data?.error ?? 'Impossible de charger les modeles.');
      setModeles([]);
      setPagination((prev) => ({ ...prev, totalRecords: 0, totalPages: 0 }));
    } finally {
      setModelesLoading(false);
    }
  }, [debouncedSearch, filterMarqueId, pageState.page, pageState.pageSize, reloadToken]);

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

  // Handle View Details (NEW)
  const handleViewModele = (modele: Modele) => {
    setViewModele(modele);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setViewModele(null);
  };

  const handleOpenDialog = (mode: DialogMode, modele?: Modele) => {
    setDialogMode(mode);
    setCurrentModele(modele ?? null);

    if (mode === 'edit' && modele) {
      setFormState({
        name: modele.name,
        idMarque: modele.idMarque ?? null,
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

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
    setCurrentModele(null);
  };

  const handleFormChange = <K extends keyof ModeleFormState>(
    key: K,
    value: ModeleFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!formState.name.trim()) {
      setModelesError('Le nom du modèle est requis.');
      return;
    }

    if (formState.idMarque === null) {
      setModelesError('Veuillez sélectionner une marque.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formState.name.trim(),
        idMarque: formState.idMarque,
        imageUrl: formState.imageUrl || null,
        active: formState.active,
      };

      if (dialogMode === 'edit' && currentModele) {
        await modeleApi.update(currentModele.id, payload);
      } else {
        await modeleApi.create(payload);
        setPageState((prev) => ({ ...prev, page: 1 }));
      }

      setDialogOpen(false);
      setReloadToken((value) => value + 1);
    } catch (err: any) {
      console.error('Failed to save modele', err);
      setModelesError(err?.response?.data?.error ?? 'Impossible de sauvegarder le modèle.');
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
      setModelesError(
        err?.response?.data?.error ?? "Impossible de mettre à jour l'état du modèle."
      );
    } finally {
      setTogglingId(null);
    }
  };

  const columns = useModeleColumns({
    hasUpdate,
    togglingId,
    onView: handleViewModele, // NEW
    onEdit: (modele) => handleOpenDialog('edit', modele),
    onToggleActive: handleToggleActive,
  });

  const isFormValid = formState.name.trim().length > 0 && formState.idMarque !== null;

  const handleFilterChange = (value: number | 'all') => {
    setFilterMarqueId(value);
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
        <ModeleFilters
          marques={marques}
          marquesLoading={marquesLoading}
          filterMarqueId={filterMarqueId}
          searchQuery={searchQuery}
          totalRecords={pagination.totalRecords}
          hasCreate={hasCreate}
          error={modelesError}
          onClearError={() => setModelesError(null)}
          onChangeMarque={handleFilterChange}
          onSearchChange={setSearchQuery}
          onCreate={() => handleOpenDialog('create')}
        />

        <ModeleTable
          rows={modeles}
          columns={columns}
          loading={modelesLoading}
          error={modelesError}
          pagination={pagination}
          onPaginationChange={handlePaginationModelChange}
          onClearError={() => setModelesError(null)}
        />

        {/* Edit Dialog */}
        <ModeleDialog
          open={dialogOpen}
          dialogMode={dialogMode}
          formState={formState}
          marques={marques}
          saving={saving}
          isFormValid={isFormValid}
          onClose={handleCloseDialog}
          onSave={handleSave}
          onChangeField={handleFormChange}
        />

        {/* View Details Dialog (NEW) */}
        <ModeleDetailsDialog
          open={viewDialogOpen}
          modele={viewModele}
          onClose={handleCloseViewDialog}
        />
      </Stack>
    </Box>
  );
};
