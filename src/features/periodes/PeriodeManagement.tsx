// src/features/periodes/PeriodeManagement.tsx

import React, { useCallback, useEffect, useState } from 'react';
import { Box, Stack } from '@mui/material';
import type { GridPaginationModel } from '@mui/x-data-grid';
import { periodeApi, type Periode } from '../../api/endpoints/periode.api';
import { typeperiodeApi, type TypePeriode } from '../../api/endpoints/typeperiode.api';
import { useAuthStore } from '../../store/authStore';
import { PeriodeFilters } from './PeriodeFilters';
import { PeriodeTable } from './PeriodeTable';
import { PeriodeDialog } from './PeriodeDialog';
import { usePeriodeColumns } from './usePeriodeColumns';
import type { DialogMode, PeriodeFormState, PaginationState } from './periodeTypes';

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  pageSize: 10,
  totalRecords: 0,
  totalPages: 0,
};

export const PeriodeManagement: React.FC = () => {
  const hasCreate = useAuthStore((state) => state.hasPermission('PERIODE_CREATE'));
  const hasUpdate = useAuthStore((state) => state.hasPermission('PERIODE_UPDATE'));

  const [periodes, setPeriodes] = useState<Periode[]>([]);
  const [typePeriodes, setTypePeriodes] = useState<TypePeriode[]>([]);
  const [selectedTypePeriode, setSelectedTypePeriode] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [pageState, setPageState] = useState({ page: 1, pageSize: 10 });
  const [reloadToken, setReloadToken] = useState(0);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('create');
  const [currentPeriode, setCurrentPeriode] = useState<Periode | null>(null);
  const [formState, setFormState] = useState<PeriodeFormState>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    week: 0,
    startedDate: '',
    endDate: '',
    typePeriodeId: 0,
  });
  const [saving, setSaving] = useState(false);

  const loadTypePeriodes = useCallback(async () => {
    try {
      const response = await typeperiodeApi.listActiveTypePeriodes();
      
      // Handle different response structures
      let typesArray: TypePeriode[] = [];

      const respAny = response as any;
      
      if (respAny?.data?.data && Array.isArray(respAny.data.data)) {
        // Case: response = { data: { data: [...] } }
        typesArray = respAny.data.data;
      } else if (respAny?.data && Array.isArray(respAny.data)) {
        // Case: response = { data: [...] }
        typesArray = respAny.data;
      } else if (Array.isArray(respAny)) {
        // Case: response = [...]
        typesArray = respAny;
      }
      
      console.log('Loaded type periodes:', typesArray);
      setTypePeriodes(typesArray);
    } catch (err: any) {
      console.error('Failed to load type periodes', err);
      setTypePeriodes([]);
    }
  }, []);

  const loadPeriodes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await periodeApi.listActivePeriodes({
        page: pageState.page,
        pageSize: pageState.pageSize,
      });

      // Work with a typed-any to safely access nested properties when the response
      // shape can vary between an array and different nested objects from the API.
      const respAny = response as any;

      // Extract data from the nested structure
      let filteredData: Periode[] = [];
      
      if (respAny?.data?.data?.data && Array.isArray(respAny.data.data.data)) {
        // Case: response = { data: { data: { data: [...] } } }
        filteredData = respAny.data.data.data;
      } else if (respAny?.data?.data && Array.isArray(respAny.data.data)) {
        // Case: response = { data: { data: [...] } }
        filteredData = respAny.data.data;
      } else if (respAny?.data && Array.isArray(respAny.data)) {
        // Case: response = { data: [...] }
        filteredData = respAny.data;
      } else if (Array.isArray(respAny)) {
        // Case: response = [... ]
        filteredData = respAny;
      }
      
      if (selectedTypePeriode) {
        filteredData = filteredData.filter(p => p.typePeriodeId === selectedTypePeriode);
      }

      setPeriodes(filteredData);
      
      const paginationData = respAny?.data?.data?.pagination || respAny?.data?.pagination || respAny?.pagination;
      setPagination({
        page: paginationData?.page ?? pageState.page,
        pageSize: paginationData?.pageSize ?? pageState.pageSize,
        totalRecords: paginationData?.totalCount ?? filteredData.length,
        totalPages: paginationData?.totalPages ?? 1,
      });
    } catch (err: any) {
      console.error('Failed to load periodes', err);
      setError(err?.response?.data?.error ?? 'Impossible de charger les périodes.');
      setPeriodes([]);
      setPagination((prev) => ({ ...prev, totalRecords: 0, totalPages: 0 }));
    } finally {
      setLoading(false);
    }
  }, [pageState.page, pageState.pageSize, reloadToken, selectedTypePeriode]);

  useEffect(() => {
    loadTypePeriodes();
  }, [loadTypePeriodes]);

  useEffect(() => {
    loadPeriodes();
  }, [loadPeriodes]);

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPageState({
      page: model.page + 1,
      pageSize: model.pageSize,
    });
  };

  const getTypePeriodeName = useCallback(
    (id: number) => {
      const type = typePeriodes.find((t) => t.id === id);
      return type?.name || 'Inconnu';
    },
    [typePeriodes]
  );

  const handleOpenDialog = (mode: DialogMode, periode?: Periode) => {
    setDialogMode(mode);
    setCurrentPeriode(periode ?? null);
    if (mode === 'edit' && periode) {
      setFormState({
        year: periode.year,
        month: periode.month,
        week: periode.week,
        startedDate: periode.startedDate,
        endDate: periode.endDate,
        typePeriodeId: periode.typePeriodeId,
      });
    } else {
      setFormState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        week: 0,
        startedDate: '',
        endDate: '',
        typePeriodeId: typePeriodes[0]?.id || 0,
      });
    }
    setError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
    setCurrentPeriode(null);
  };

  const handleFormChange = <K extends keyof PeriodeFormState>(
    key: K,
    value: PeriodeFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!formState.startedDate || !formState.endDate || !formState.typePeriodeId) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        year: formState.year,
        month: formState.month,
        week: formState.week || undefined,
        startedDate: formState.startedDate,
        endDate: formState.endDate,
        typePeriodeId: formState.typePeriodeId,
      };

      if (dialogMode === 'edit' && currentPeriode) {
        await periodeApi.updatePeriode(currentPeriode.id, payload);
      } else {
        await periodeApi.createPeriode(payload);
        setPageState((prev) => ({ ...prev, page: 1 }));
      }

      setDialogOpen(false);
      setReloadToken((value) => value + 1);
    } catch (err: any) {
      console.error('Failed to save periode', err);
      setError(err?.response?.data?.error ?? 'Impossible de sauvegarder les changements.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (periode: Periode) => {
    try {
      setTogglingId(periode.id);
      if (periode.active) {
        await periodeApi.deactivatePeriode(periode.id);
      } else {
        await periodeApi.activatePeriode(periode.id);
      }
      setReloadToken((value) => value + 1);
    } catch (err: any) {
      console.error('Failed to toggle periode', err);
      setError(err?.response?.data?.error ?? "Impossible de mettre à jour l'état de la période.");
    } finally {
      setTogglingId(null);
    }
  };

  const columns = usePeriodeColumns({
    hasUpdate,
    togglingId,
    onEdit: (periode) => handleOpenDialog('edit', periode),
    onToggleActive: handleToggleActive,
    getTypePeriodeName,
  });

  const isFormValid =
    formState.year > 0 &&
    formState.month > 0 &&
    formState.startedDate.length > 0 &&
    formState.endDate.length > 0 &&
    formState.typePeriodeId > 0;

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
        maxWidth: 1200,
        mx: 'auto',
      }}
    >
      <Stack spacing={3}>
        <PeriodeFilters
          typePeriodes={typePeriodes}
          selectedTypePeriode={selectedTypePeriode}
          totalRecords={pagination.totalRecords}
          hasCreate={hasCreate}
          error={error}
          onClearError={() => setError(null)}
          onChangeTypePeriode={setSelectedTypePeriode}
          onCreate={() => handleOpenDialog('create')}
        />

        <PeriodeTable
          rows={periodes}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPaginationChange={handlePaginationModelChange}
          error={error}
          onClearError={() => setError(null)}
        />

        <PeriodeDialog
          open={dialogOpen}
          dialogMode={dialogMode}
          formState={formState}
          typePeriodes={typePeriodes}
          saving={saving}
          isFormValid={isFormValid}
          error={error}
          onClose={handleCloseDialog}
          onSave={handleSave}
          onChangeField={handleFormChange}
          onClearError={() => setError(null)}
        />
      </Stack>
    </Box>
  );
};
