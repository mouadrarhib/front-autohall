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
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { DataTable } from '../../components/common/DataTable';
import { filialeApi, Filiale } from '../../api/endpoints/filiale.api';
import { useRoles, ROLES } from '../../hooks/useRoles';
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
  
  // ✅ CHANGED: Use roles instead of permissions
  const { isAdminFonctionnel } = useRoles();
  const canManageFiliales = isAdminFonctionnel;

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
    
    // ✅ CHANGED: Check role instead of permission
    if (!canManageFiliales || togglingId === filiale.id) return;

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
            label={params.row.active ? 'Active' : 'Inactive'}
            color={params.row.active ? 'success' : 'default'}
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
          const row = (params as GridRenderCellParams)?.row as Partial<Filiale> | undefined;
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
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* ✅ CHANGED: Check role instead of permission */}
              {canManageFiliales && (
                <>
                  <Tooltip title="Edit Filiale">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={(event) => handleEdit(params.row.id, event)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={params.row.active}
                        onChange={(event) => handleToggleActive(params.row, event as any)}
                        onClick={(event) => event.stopPropagation()}
                        disabled={isToggling}
                        size="small"
                      />
                    }
                    label=""
                    sx={{ mr: 0 }}
                  />
                  {isToggling && (
                    <CircularProgress size={20} sx={{ ml: 1 }} />
                  )}
                </>
              )}
            </Box>
          );
        },
      },
    ],
    [canManageFiliales, togglingId, handleEdit, handleToggleActive]
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Filiales Management
        </Typography>

        {/* ✅ CHANGED: Check role instead of permission */}
        {canManageFiliales && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/filiales/create')}
            sx={{ textTransform: 'none' }}
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

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
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
        loading={loading}
        pagination={pagination}
        onPaginationChange={(model) => {
          handlePaginationChange(model);
          loadFiliales(model.page, model.pageSize);
        }}
      />
    </Box>
  );
};
