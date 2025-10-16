// src/features/groupement/VersionManagement.tsx
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
  Grid,
  Typography,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { DataTable } from '../../components/common/DataTable';
import { versionApi, Version } from '../../api/endpoints/version.api';
import { modeleApi, Modele } from '../../api/endpoints/modele.api';
import { marqueApi, Marque } from '../../api/endpoints/marque.api';
import { useAuthStore } from '../../store/authStore';

interface VersionManagementProps {
  groupementType: 'Filiale' | 'Succursale';
  siteId: number;
}

export const VersionManagement: React.FC<VersionManagementProps> = ({
  groupementType,
  siteId,
}) => {
  const hasCreatePermission = useAuthStore((state) => state.hasPermission('VERSION_CREATE'));
  const hasUpdatePermission = useAuthStore((state) => state.hasPermission('VERSION_UPDATE'));

  const [versions, setVersions] = useState<Version[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [allModeles, setAllModeles] = useState<Modele[]>([]);
  const [selectedMarque, setSelectedMarque] = useState<number | null>(null);
  const [selectedModele, setSelectedModele] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  const [formData, setFormData] = useState({
    name: '',
    idModele: 0,
    volume: 0,
    price: 0,
    tm: 0,
    margin: 0,
  });

  useEffect(() => {
    loadMarques();
    if (groupementType === 'Succursale') {
      loadAllModeles();
    }
  }, [siteId, groupementType]);

  useEffect(() => {
    if (selectedMarque) {
      loadModeles();
    } else {
      setModeles([]);
      setSelectedModele(null);
    }
  }, [selectedMarque]);

  useEffect(() => {
    if (selectedModele) {
      loadVersions();
    } else {
      if (groupementType === 'Succursale' && !selectedMarque) {
        loadAllVersions();
      } else {
        setVersions([]);
      }
    }
  }, [selectedModele, pagination.page, pagination.pageSize, groupementType]);

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

  const loadAllModeles = async () => {
    try {
      const response = await modeleApi.list({
        onlyActive: true,
        pageSize: 1000,
      });
      setAllModeles(response.data || []);
    } catch (err: any) {
      console.error('Failed to load modeles:', err);
    }
  };

  const loadModeles = async () => {
    if (!selectedMarque) return;

    try {
      const response = await modeleApi.listByMarque(selectedMarque, {
        onlyActive: true,
        pageSize: 1000,
      });
      setModeles(response.data || []);
      if (response.data && response.data.length > 0 && groupementType === 'Filiale') {
        setSelectedModele(response.data[0].id);
      } else {
        setSelectedModele(null);
      }
    } catch (err: any) {
      console.error('Failed to load modeles:', err);
      setError(err.response?.data?.error || 'Failed to load modeles');
    }
  };

  const loadVersions = async () => {
    if (!selectedModele) return;

    try {
      setLoading(true);
      setError(null);
      const response = await versionApi.listByModele({
        idModele: selectedModele,
        onlyActive: false,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });

      setVersions(response.data || []);
      setPagination((prev) => ({
        ...prev,
        totalRecords: response.pagination?.totalRecords || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
    } catch (err: any) {
      console.error('Failed to load versions:', err);
      setError(err.response?.data?.error || 'Failed to load versions');
    } finally {
      setLoading(false);
    }
  };

  const loadAllVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await versionApi.list({
        onlyActive: false,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });

      setVersions(response.data || []);
      setPagination((prev) => ({
        ...prev,
        totalRecords: response.pagination?.totalRecords || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
    } catch (err: any) {
      console.error('Failed to load versions:', err);
      setError(err.response?.data?.error || 'Failed to load versions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (version?: Version) => {
    if (version) {
      setEditingVersion(version);
      setFormData({
        name: version.name,
        idModele: version.idModele,
        volume: version.volume,
        price: version.price,
        tm: version.tm,
        margin: version.margin,
      });
    } else {
      setEditingVersion(null);
      setFormData({
        name: '',
        idModele: selectedModele || 0,
        volume: 0,
        price: 0,
        tm: 0,
        margin: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVersion(null);
    setFormData({
      name: '',
      idModele: 0,
      volume: 0,
      price: 0,
      tm: 0,
      margin: 0,
    });
    setError(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (editingVersion) {
        await versionApi.update(editingVersion.id, formData);
      } else {
        await versionApi.create(formData);
      }

      handleCloseDialog();
      if (selectedModele) {
        await loadVersions();
      } else {
        await loadAllVersions();
      }
    } catch (err: any) {
      console.error('Failed to save version:', err);
      setError(err.response?.data?.error || 'Failed to save version');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (version: Version) => {
    try {
      if (version.active) {
        await versionApi.deactivate(version.id);
      } else {
        await versionApi.activate(version.id);
      }
      if (selectedModele) {
        await loadVersions();
      } else {
        await loadAllVersions();
      }
    } catch (err: any) {
      console.error('Failed to toggle version status:', err);
      setError(err.response?.data?.error || 'Failed to update version status');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Version Name',
      flex: 1,
      minWidth: 150,
    },
    ...(groupementType === 'Succursale' || !selectedModele
      ? [
          {
            field: 'modeleName',
            headerName: 'Modèle',
            flex: 0.8,
            minWidth: 130,
          },
        ]
      : []),
    {
      field: 'volume',
      headerName: 'Volume',
      width: 100,
      align: 'center' as const,
      headerAlign: 'center' as const,
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      align: 'right' as const,
      headerAlign: 'right' as const,
      renderCell: (params: any) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {params.row.price.toLocaleString()} DH
        </Typography>
      ),
    },
    {
      field: 'tm',
      headerName: 'TM',
      width: 90,
      align: 'center' as const,
      headerAlign: 'center' as const,
      renderCell: (params: any) => (
        <Chip
          label={`${(params.row.tm * 100).toFixed(1)}%`}
          size="small"
          color="info"
          variant="outlined"
        />
      ),
    },
    {
      field: 'margin',
      headerName: 'Margin',
      width: 90,
      align: 'center' as const,
      headerAlign: 'center' as const,
      renderCell: (params: any) => (
        <Chip
          label={`${(params.row.margin * 100).toFixed(1)}%`}
          size="small"
          color="success"
          variant="outlined"
        />
      ),
    },
    {
      field: 'active',
      headerName: 'Status',
      width: 110,
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
      cellClassName: 'action-cell',
      renderCell: (params: any) => (
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

  if (marques.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Please create at least one Marque before adding Versions.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {groupementType === 'Succursale' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Viewing and managing all versions from all modèles
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2}>
        <Box display="flex" gap={2} alignItems="center" flex={1}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>
              {groupementType === 'Succursale' ? 'Marque (Optional)' : 'Marque'}
            </InputLabel>
            <Select
              value={selectedMarque || ''}
              label={groupementType === 'Succursale' ? 'Marque (Optional)' : 'Marque'}
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

          {(selectedMarque || groupementType === 'Succursale') && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>
                {groupementType === 'Succursale' ? 'Modèle (Optional)' : 'Modèle'}
              </InputLabel>
              <Select
                value={selectedModele || ''}
                label={groupementType === 'Succursale' ? 'Modèle (Optional)' : 'Modèle'}
                onChange={(e) => setSelectedModele(e.target.value ? Number(e.target.value) : null)}
                disabled={!selectedMarque && groupementType === 'Filiale'}
              >
                {groupementType === 'Succursale' && <MenuItem value="">All Modèles</MenuItem>}
                {modeles.map((modele) => (
                  <MenuItem key={modele.id} value={modele.id}>
                    {modele.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Chip label={`${versions.length} Versions`} color="primary" sx={{ fontWeight: 600 }} />
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
            Add Version
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <DataTable
        rows={versions}
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
        <DialogTitle>{editingVersion ? 'Edit Version' : 'Add New Version'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Version Name"
                type="text"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense" required>
                <InputLabel>Modèle</InputLabel>
                <Select
                  value={formData.idModele}
                  label="Modèle"
                  onChange={(e) => setFormData({ ...formData, idModele: Number(e.target.value) })}
                  disabled={saving}
                >
                  {(groupementType === 'Succursale' ? allModeles : modeles).map((modele) => (
                    <MenuItem key={modele.id} value={modele.id}>
                      {modele.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Volume"
                type="number"
                fullWidth
                required
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: Number(e.target.value) })}
                disabled={saving}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Price (DH)"
                type="number"
                fullWidth
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                disabled={saving}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="TM (%)"
                type="number"
                fullWidth
                required
                value={formData.tm * 100}
                onChange={(e) => setFormData({ ...formData, tm: Number(e.target.value) / 100 })}
                disabled={saving}
                inputProps={{ min: 0, max: 40, step: 0.1 }}
                helperText="Max 40%"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Margin (%)"
                type="number"
                fullWidth
                required
                value={formData.margin * 100}
                onChange={(e) =>
                  setFormData({ ...formData, margin: Number(e.target.value) / 100 })
                }
                disabled={saving}
                inputProps={{ min: 0, max: 40, step: 0.1 }}
                helperText="Max 40%"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={
              saving ||
              !formData.name.trim() ||
              !formData.idModele ||
              formData.volume <= 0 ||
              formData.price <= 0
            }
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {saving ? 'Saving...' : editingVersion ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
