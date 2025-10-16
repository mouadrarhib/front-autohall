// src/features/groupement/ModeleManagement.tsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { DataTable } from '../../components/common/DataTable';
import { modeleApi, Modele } from '../../api/endpoints/modele.api';
import { marqueApi, Marque } from '../../api/endpoints/marque.api';
import { useAuthStore } from '../../store/authStore';

interface ModeleManagementProps {
  groupementType: 'Filiale' | 'Succursale';
  siteId: number;
}

export const ModeleManagement: React.FC<ModeleManagementProps> = ({
  groupementType,
  siteId,
}) => {
  const hasCreatePermission = useAuthStore((state) => state.hasPermission('MODELE_CREATE'));
  const hasUpdatePermission = useAuthStore((state) => state.hasPermission('MODELE_UPDATE'));

  const [modeles, setModeles] = useState<Modele[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [selectedMarque, setSelectedMarque] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingModele, setEditingModele] = useState<Modele | null>(null);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  const [formData, setFormData] = useState({
    name: '',
    idMarque: 0,
    imageUrl: '',
  });

  useEffect(() => {
    loadMarques();
  }, [siteId, groupementType]);

  useEffect(() => {
    if (selectedMarque) {
      loadModeles();
    } else {
      if (groupementType === 'Succursale') {
        loadAllModeles();
      } else {
        setModeles([]);
      }
    }
  }, [selectedMarque, pagination.page, pagination.pageSize, groupementType]);

  const loadMarques = async () => {
    try {
      let response;
      if (groupementType === 'Filiale') {
        response = await marqueApi.listByFiliale(siteId, {
          onlyActive: true,
          pageSize: 1000,
        });
      } else {
        response = await marqueApi.list({
          onlyActive: true,
          pageSize: 1000,
        });
      }
      setMarques(response.data || []);
      if (response.data && response.data.length > 0 && groupementType === 'Filiale') {
        setSelectedMarque(response.data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load marques:', err);
      setError(err.response?.data?.error || 'Failed to load marques');
    }
  };

  const loadModeles = async () => {
    if (!selectedMarque) return;

    try {
      setLoading(true);
      setError(null);
      const response = await modeleApi.listByMarque(selectedMarque, {
        onlyActive: false,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });

      setModeles(response.data || []);
      setPagination((prev) => ({
        ...prev,
        totalRecords: response.pagination?.totalRecords || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
    } catch (err: any) {
      console.error('Failed to load modeles:', err);
      setError(err.response?.data?.error || 'Failed to load modeles');
    } finally {
      setLoading(false);
    }
  };

  const loadAllModeles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await modeleApi.list({
        onlyActive: false,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });

      setModeles(response.data || []);
      setPagination((prev) => ({
        ...prev,
        totalRecords: response.pagination?.totalRecords || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
    } catch (err: any) {
      console.error('Failed to load modeles:', err);
      setError(err.response?.data?.error || 'Failed to load modeles');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (modele?: Modele) => {
    if (modele) {
      setEditingModele(modele);
      setFormData({
        name: modele.name,
        idMarque: modele.idMarque,
        imageUrl: modele.imageUrl || '',
      });
    } else {
      setEditingModele(null);
      setFormData({
        name: '',
        idMarque: selectedMarque || 0,
        imageUrl: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingModele(null);
    setFormData({ name: '', idMarque: 0, imageUrl: '' });
    setError(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (editingModele) {
        await modeleApi.update(editingModele.id, {
          name: formData.name,
          idMarque: formData.idMarque,
          imageUrl: formData.imageUrl || null,
        });
      } else {
        await modeleApi.create({
          name: formData.name,
          idMarque: formData.idMarque,
          imageUrl: formData.imageUrl || null,
          active: true,
        });
      }

      handleCloseDialog();
      if (selectedMarque) {
        await loadModeles();
      } else {
        await loadAllModeles();
      }
    } catch (err: any) {
      console.error('Failed to save modele:', err);
      setError(err.response?.data?.error || 'Failed to save modele');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (modele: Modele) => {
    try {
      if (modele.active) {
        await modeleApi.deactivate(modele.id);
      } else {
        await modeleApi.activate(modele.id);
      }
      if (selectedMarque) {
        await loadModeles();
      } else {
        await loadAllModeles();
      }
    } catch (err: any) {
      console.error('Failed to toggle modele status:', err);
      setError(err.response?.data?.error || 'Failed to update modele status');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Modèle Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'marqueName',
      headerName: 'Marque',
      flex: 0.8,
      minWidth: 150,
    },
    {
      field: 'imageUrl',
      headerName: 'Image',
      width: 80,
      align: 'center' as const,
      headerAlign: 'center' as const,
      renderCell: (params) =>
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
      renderCell: (params) => (
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
      cellClassName: 'action-cell',
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            width: '100%',
            height: '100%',
          }}
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
                  {params.row.active ? <CancelIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];

  if (marques.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Please create at least one Marque before adding Modèles.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {groupementType === 'Succursale' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Viewing and managing all modèles from all marques
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2}>
        <Box display="flex" gap={2} alignItems="center" flex={1}>
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>
              {groupementType === 'Succursale' ? 'Filter by Marque (Optional)' : 'Filter by Marque'}
            </InputLabel>
            <Select
              value={selectedMarque || ''}
              label={groupementType === 'Succursale' ? 'Filter by Marque (Optional)' : 'Filter by Marque'}
              onChange={(e) => setSelectedMarque(e.target.value ? Number(e.target.value) : null)}
            >
              {groupementType === 'Succursale' && <MenuItem value="">All Marques</MenuItem>}
              {marques.map((marque) => (
                <MenuItem key={marque.id} value={marque.id}>
                  {marque.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Chip label={`${modeles.length} Modèles`} color="primary" sx={{ fontWeight: 600 }} />
        </Box>
        {hasCreatePermission && (
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
            Add Modèle
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <DataTable
        rows={modeles}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingModele ? 'Edit Modèle' : 'Add New Modèle'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Modèle Name"
            type="text"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={saving}
          />
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Marque</InputLabel>
            <Select
              value={formData.idMarque}
              label="Marque"
              onChange={(e) => setFormData({ ...formData, idMarque: Number(e.target.value) })}
              disabled={saving}
            >
              {marques.map((marque) => (
                <MenuItem key={marque.id} value={marque.id}>
                  {marque.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Image URL (Optional)"
            type="text"
            fullWidth
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            disabled={saving}
            placeholder="https://example.com/model-image.png"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !formData.name.trim() || !formData.idMarque}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {saving ? 'Saving...' : editingModele ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
