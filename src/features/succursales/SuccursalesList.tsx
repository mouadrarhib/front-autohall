// src/features/succursales/SuccursalesList.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import type { GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { DataTable } from '../../components/common/DataTable';
import { succursaleApi, Succursale } from '../../api/endpoints/succursale.api';
import { useAuthStore } from '../../store/authStore';
import type { PaginationMeta } from '../../types/api.types';

const initialPagination: PaginationMeta = {
  page: 1,
  pageSize: 25,
  totalRecords: 0,
  totalPages: 0,
};

const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch (error) {
    console.warn('Failed to format date', value, error);
    return value;
  }
};

export const SuccursalesList: React.FC = () => {
  const navigate = useNavigate();
  const hasCreatePermission = useAuthStore((state) =>
    state.hasPermission('SUCCURSALE_CREATE')
  );
  const hasUpdatePermission = useAuthStore((state) =>
    state.hasPermission('SUCCURSALE_UPDATE')
  );

  const [succursales, setSuccursales] = useState<Succursale[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(initialPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const isSearchMode = Boolean(appliedSearch.trim());

  const loadSuccursales = useCallback(
    async ({
      page = pagination.page,
      pageSize = pagination.pageSize,
      search = appliedSearch,
      onlyActive = showActiveOnly,
    } = {}) => {
    try {
      setLoading(true);
      setError(null);

      if (search.trim()) {
        const data = await succursaleApi.searchSuccursales(
          search.trim(),
          onlyActive ? true : undefined
        );

        setSuccursales(data ?? []);
        setPagination({
          page: 1,
          pageSize: Math.max(pageSize, data?.length || 10),
          totalRecords: data?.length ?? 0,
          totalPages: 1,
        });
        return;
      }

      const response = await succursaleApi.listSuccursales({
        page,
        pageSize,
        onlyActive: onlyActive ? true : undefined,
      });

      const responseData = response?.data ?? [];
      const paginationData = response?.pagination;

      setSuccursales(responseData);
      setPagination({
        page,
        pageSize,
        totalRecords: paginationData?.totalCount ?? responseData.length,
        totalPages: paginationData?.totalPages ?? 1,
      });
    } catch (err: any) {
      console.error('Failed to load succursales:', err);
      setError(err.response?.data?.error || 'Failed to load succursales');
      setSuccursales([]);
    } finally {
      setLoading(false);
    }
    },
    [appliedSearch, pagination.page, pagination.pageSize, showActiveOnly]
  );

  useEffect(() => {
    loadSuccursales();
  }, [loadSuccursales]);

  const handlePaginationChange = (model: { page: number; pageSize: number }) => {
    setPagination((prev) => ({
      ...prev,
      page: model.page,
      pageSize: model.pageSize,
    }));
  };

  const handleToggleActive = async (succursale: Succursale, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!hasUpdatePermission || togglingId === succursale.id) return;

    try {
      setTogglingId(succursale.id);

      if (succursale.active) {
        await succursaleApi.deactivateSuccursale(succursale.id);
      } else {
        await succursaleApi.activateSuccursale(succursale.id);
      }

      setSuccursales((prev) =>
        prev.map((s) =>
          s.id === succursale.id ? { ...s, active: !s.active } : s
        )
      );
    } catch (err: any) {
      console.error('Failed to toggle succursale:', err);
      setError(err.response?.data?.error || 'Failed to update succursale');
      await loadSuccursales();
    } finally {
      setTogglingId(null);
    }
  };

  const handleEdit = (succursaleId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/succursales/${succursaleId}/edit`);
  };

  const handleSearch = () => {
    const trimmed = searchTerm.trim();
    setPagination((prev) => ({ ...prev, page: 1 }));
    setAppliedSearch(trimmed);
    loadSuccursales({
      page: 1,
      pageSize: pagination.pageSize,
      search: trimmed,
      onlyActive: showActiveOnly,
    });
  };

  const columns = useMemo<GridColDef<Succursale>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Succursale Name',
        flex: 1,
        minWidth: 220,
      },
      {
        field: 'active',
        headerName: 'Status',
        width: 160,
        renderCell: (cellParams) => {
          const params: GridRenderCellParams = cellParams as GridRenderCellParams;
          return (
            <Chip
              label={params.value ? 'Active' : 'Inactive'}
              color={params.value ? 'success' : 'default'}
              size="small"
            />
          );
        },
      },
      {
        field: 'updatedAt',
        headerName: 'Last Updated',
        flex: 0.7,
        minWidth: 200,
        valueGetter: (params) => {
          const typedParams = params as { row?: Partial<Succursale> } | undefined;
          const row = typedParams?.row;
          const value = row?.updatedAt ?? (row as any)?.UpdatedAt;
          return formatDate(value);
        },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 220,
        sortable: false,
        renderCell: (cellParams) => {
          const params: GridRenderCellParams = cellParams as GridRenderCellParams;
          const isToggling = togglingId === params.row.id;

          return (
            <Box display="flex" gap={0.5} alignItems="center">
              {hasUpdatePermission && (
                <>
                  <Tooltip title="Edit Succursale">
                    <IconButton
                      size="small"
                      onClick={(event) => handleEdit(params.row.id, event)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={params.row.active ? 'Deactivate' : 'Activate'}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <Switch
                        size="small"
                        checked={params.row.active}
                        onChange={(event) => handleToggleActive(params.row, event as any)}
                        onClick={(event) => event.stopPropagation()}
                        disabled={isToggling}
                      />
                      {isToggling && (
                        <CircularProgress
                          size={20}
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-10px',
                            marginLeft: '-10px',
                          }}
                        />
                      )}
                    </Box>
                  </Tooltip>
                </>
              )}
            </Box>
          );
        },
      },
    ],
    [hasUpdatePermission, togglingId, handleEdit, handleToggleActive]
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Succursales Management</Typography>
        {hasCreatePermission && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/succursales/create')}
          >
            Create Succursale
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
        <TextField
          placeholder="Search succursales..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          onKeyPress={(event) => event.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
          sx={{ minWidth: 260 }}
        />
        <Button variant="contained" onClick={handleSearch} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
        </Button>
        <FormControlLabel
          control={
            <Switch
              checked={showActiveOnly}
              onChange={(event) => {
                const value = event.target.checked;
                setShowActiveOnly(value);
                setPagination((prev) => ({ ...prev, page: 1 }));
                loadSuccursales({
                  page: 1,
                  pageSize: pagination.pageSize,
                  search: appliedSearch,
                  onlyActive: value,
                });
              }}
            />
          }
          label="Show Active Only"
        />
        {isSearchMode && (
          <Chip
            label={`Search: ${appliedSearch}`}
            onDelete={() => {
              setAppliedSearch('');
              setSearchTerm('');
            }}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      <DataTable
        rows={succursales}
        columns={columns}
        pagination={pagination}
        loading={loading}
        onPaginationChange={handlePaginationChange}
      />
    </Box>
  );
};
