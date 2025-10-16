// src/features/groupement/MarqueManagement.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tooltip,
  CircularProgress,
  alpha,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { DataTable } from '../../components/common/DataTable';
import { marqueApi, Marque } from '../../api/endpoints/marque.api';
import { useAuthStore } from '../../store/authStore';

interface MarqueManagementProps {
  groupementType: 'Filiale' | 'Succursale';
  siteId: number;
}

export const MarqueManagement: React.FC<MarqueManagementProps> = ({
  groupementType,
  siteId,
}) => {
  const hasCreatePermission = useAuthStore((state) => state.hasPermission('MARQUE_CREATE'));
  const hasUpdatePermission = useAuthStore((state) => state.hasPermission('MARQUE_UPDATE'));

  const [marques, setMarques] = useState<Marque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMarque, setEditingMarque] = useState<Marque | null>(null);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
  });

  useEffect(() => {
    loadMarques();
  }, [siteId, groupementType, pagination.page, pagination.pageSize]);

  const loadMarques = async () => {
    try {
      setLoading(true);
      setError(null);

      if (groupementType === 'Filiale') {
        const response = await marqueApi.listByFiliale(siteId, {
          onlyActive: false,
          page: pagination.page,
          pageSize: pagination.pageSize,
        });
        setMarques(response.data || []);
        setPagination((prev) => ({
          ...prev,
          totalRecords: response.pagination?.totalRecords || 0,
          totalPages: response.pagination?.totalPages || 0,
        }));
      } else {
        // Succursale - just load all marques, don't care about filiales
        const response = await marqueApi.list({
          onlyActive: false,
          page: pagination.page,
          pageSize: pagination.pageSize,
        });
        setMarques(response.data || []);
        setPagination((prev) => ({
          ...prev,
          totalRecords: response.pagination?.totalRecords || 0,
          totalPages: response.pagination?.totalPages || 0,
        }));
      }
    } catch (err: any) {
      console.error('Failed to load marques:', err);
      setError(err.response?.data?.error || 'Failed to load marques');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (marque?: Marque) => {
    if (marque) {
      setEditingMarque(marque);
      setFormData({
        name: marque.name,
        imageUrl: marque.imageUrl || '',
      });
    } else {
      setEditingMarque(null);
      setFormData({
        name: '',
        imageUrl: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMarque(null);
    setFormData({ name: '', imageUrl: '' });
    setError(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (editingMarque) {
        // When editing, keep the existing idFiliale
        await marqueApi.update(editingMarque.id, {
          name: formData.name,
          imageUrl: formData.imageUrl || null,
          idFiliale: editingMarque.idFiliale, // Keep existing filiale
        });
      } else {
        // When creating from Filiale, use siteId as idFiliale
        await marqueApi.create({
          name: formData.name,
          idFiliale: siteId,
          imageUrl: formData.imageUrl || null,
          active: true,
        });
      }

      handleCloseDialog();
      await loadMarques();
    } catch (err: any) {
      console.error('Failed to save marque:', err);
      setError(err.response?.data?.error || 'Failed to save marque');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (marque: Marque) => {
    try {
      if (marque.active) {
        await marqueApi.deactivate(marque.id);
      } else {
        await marqueApi.activate(marque.id);
      }
      await loadMarques();
    } catch (err: any) {
      console.error('Failed to toggle marque status:', err);
      setError(err.response?.data?.error || 'Failed to update marque status');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Marque Name',
      flex: 1,
      minWidth: 200,
    },
    // ❌ Removed filialeName column completely for both Filiale and Succursale
    {
      field: 'imageUrl',
      headerName: 'Image',
      width: 80,
      align: 'center' as const,
      headerAlign: 'center' as const,
      renderCell: (params: any) =>
        params.row.imageUrl ? (
          <img
            src={params.row.imageUrl}
            alt={params.row.name}
            style={{ width: 40, height: 40, objectFit: 'contain' }}
          />
        ) : (
          <span>-</span>
        ),
    },
    {
      field: 'active',
      headerName: 'Status',
      width: 120,
      align: 'center' as const,
      headerAlign: 'center' as const,
      renderCell: (params: any) => (
        <Chip
          label={params.row.active ? 'Active' : 'Inactive'}
          color={params.row.active ? 'success' : 'default'}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      align: 'center' as const,
      headerAlign: 'center' as const,
      renderCell: (params: any) => (
        <Box 
          display="flex" 
          gap={1} 
          justifyContent="center" 
          alignItems="center"
          width="100%"
        >
          {hasUpdatePermission && (
            <>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(params.row)}
                  sx={{
                    p: '6px',
                    borderRadius: '12px',
                    border: '1px solid rgba(148, 163, 184, 0.18)',
                    backgroundColor: 'rgba(148, 163, 184, 0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(251, 191, 36, 0.16)',
                      borderColor: 'rgba(245, 158, 11, 0.4)',
                      color: 'warning.main',
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={params.row.active ? 'Deactivate' : 'Activate'}>
                <IconButton
                  size="small"
                  onClick={() => handleToggleActive(params.row)}
                  sx={{
                    p: '6px',
                    borderRadius: '12px',
                    border: '1px solid rgba(148, 163, 184, 0.18)',
                    backgroundColor: 'rgba(148, 163, 184, 0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: params.row.active
                        ? 'rgba(239, 68, 68, 0.16)'
                        : 'rgba(34, 197, 94, 0.16)',
                      borderColor: params.row.active
                        ? 'rgba(239, 68, 68, 0.35)'
                        : 'rgba(34, 197, 94, 0.35)',
                      color: params.row.active ? 'error.main' : 'success.main',
                    },
                  }}
                >
                  {params.row.active ? (
                    <CancelIcon fontSize="small" />
                  ) : (
                    <CheckCircleIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Chip label={`${marques.length} Marques`} color="primary" sx={{ fontWeight: 600 }} />
        {hasCreatePermission && groupementType === 'Filiale' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add Marque
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <DataTable
        rows={marques}
        columns={columns}
        loading={loading}
        pagination={pagination}
        getRowId={(row) => row.id}
        onPaginationChange={(model) =>
          setPagination((prev) => ({
            ...prev,
            page: model.page,
            pageSize: model.pageSize,
          }))
        }
      />

      {/* Create/Edit Dialog - only for Filiale */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMarque ? 'Edit Marque' : 'Add New Marque'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Marque Name"
            type="text"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={saving}
          />
          {/* ❌ Removed Filiale dropdown completely */}
          <TextField
            margin="dense"
            label="Image URL (Optional)"
            type="text"
            fullWidth
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            disabled={saving}
            placeholder="https://example.com/logo.png"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !formData.name.trim()}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {saving ? 'Saving...' : editingMarque ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
