// src/features/filiales/FilialesList.tsx
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
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { DataTable } from '../../components/common/DataTable';
import { filialeApi, Filiale } from '../../api/endpoints/filiale.api';
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

export const FilialesList: React.FC = () => {
  const navigate = useNavigate();
  const hasCreatePermission = useAuthStore((state) =>
    state.hasPermission('FILIALE_CREATE')
  );
  const hasUpdatePermission = useAuthStore((state) =>
    state.hasPermission('FILIALE_UPDATE')
  );

  const [filiales, setFiliales] = useState<Filiale[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(initialPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [showActiveOnly, setShowActiveOnly] = useState(true);

  const loadFiliales = useCallback(
    async (page = pagination.page, pageSize = pagination.pageSize, activeFilter = showActiveOnly) => {
      try {
        setLoading(true);
        setError(null);

        const response = await filialeApi.listFiliales({
          page,
          pageSize,
          active: activeFilter ? true : undefined,
        });
        const responseData = response?.data ?? [];
        const paginationData = response?.pagination;

        setFiliales(responseData);
        setPagination(() => ({
          page,
          pageSize,
          totalRecords: paginationData?.totalCount ?? responseData.length,
          totalPages: paginationData?.totalPages ?? 1,
        }));
      } catch (err: any) {
        console.error('Failed to load filiales:', err);
        setError(err.response?.data?.error || 'Failed to load filiales');
        setFiliales([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.pageSize, showActiveOnly]
  );

  useEffect(() => {
    loadFiliales();
  }, [pagination.page, pagination.pageSize, showActiveOnly, loadFiliales]);

  const handlePaginationChange = (model: { page: number; pageSize: number }) => {
    setPagination((prev) => ({
      ...prev,
      page: model.page,
      pageSize: model.pageSize,
    }));
  };

  const handleToggleActive = async (filiale: Filiale, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!hasUpdatePermission || togglingId === filiale.id) return;

    try {
      setTogglingId(filiale.id);

      if (filiale.active) {
        await filialeApi.deactivateFiliale(filiale.id);
      } else {
        await filialeApi.activateFiliale(filiale.id);
      }

      setFiliales((prev) =>
        prev.map((f) =>
          f.id === filiale.id ? { ...f, active: !f.active } : f
        )
      );
    } catch (err: any) {
      console.error('Failed to toggle filiale:', err);
      setError(err.response?.data?.error || 'Failed to update filiale');
      await loadFiliales();
    } finally {
      setTogglingId(null);
    }
  };

  const handleEdit = (filialeId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/filiales/${filialeId}/edit`);
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Filiale Name',
        flex: 1,
        minWidth: 220,
      },
      {
        field: 'active',
        headerName: 'Status',
        width: 160,
        renderCell: (params) => (
          <Chip
            label={params.value ? 'Active' : 'Inactive'}
            color={params.value ? 'success' : 'default'}
            size="small"
          />
        ),
      },
      {
        field: 'updatedAt',
        headerName: 'Last Updated',
        flex: 0.7,
        minWidth: 200,
        valueGetter: (params) => {
          const row = params?.row as Partial<Filiale> | undefined;
          const value = row?.updatedAt ?? (row as any)?.UpdatedAt;
          return formatDate(value);
        },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 220,
        sortable: false,
        renderCell: (params) => {
          const isToggling = togglingId === params.row.id;

          return (
            <Box display="flex" gap={0.5} alignItems="center">
              {hasUpdatePermission && (
                <>
                  <Tooltip title="Edit Filiale">
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
        <Typography variant="h4">Filiales Management</Typography>
        {hasCreatePermission && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/filiales/create')}
          >
            Create Filiale
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <FormControlLabel
          control={
            <Switch
              checked={showActiveOnly}
              onChange={(event) => {
                const value = event.target.checked;
                setShowActiveOnly(value);
                const nextPage = 1;
                setPagination((prev) => ({
                  ...prev,
                  page: nextPage,
                }));
                loadFiliales(nextPage, pagination.pageSize, value);
              }}
            />
          }
          label="Show Active Only"
        />
      </Box>

      <DataTable
        rows={filiales}
        columns={columns}
        pagination={pagination}
        loading={loading}
        onPaginationChange={(model) => {
          handlePaginationChange(model);
          loadFiliales(model.page, model.pageSize);
        }}
      />
    </Box>
  );
};
