// src/features/periodes/usePeriodeColumns.tsx

import { useMemo } from 'react';
import { Button, Chip, Stack, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import type { GridColDef } from '@mui/x-data-grid';
import type { Periode } from '../../api/endpoints/periode.api';

interface UsePeriodeColumnsArgs {
  hasUpdate: boolean;
  togglingId: number | null;
  onEdit: (periode: Periode) => void;
  onToggleActive: (periode: Periode) => void;
  getTypePeriodeName: (id: number) => string;
}

export const usePeriodeColumns = ({
  hasUpdate,
  togglingId,
  onEdit,
  onToggleActive,
  getTypePeriodeName,
}: UsePeriodeColumnsArgs): GridColDef[] => {
  return useMemo<GridColDef[]>(() => {
    const alignCellCenter = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    } as const;

    return [
      {
        field: 'year',
        headerName: 'Année',
        flex: 0.6,
        minWidth: 80,
        align: 'center',
        headerAlign: 'left',
        renderCell: (params) => <Box sx={alignCellCenter}>{params.value}</Box>,
      },
      {
        field: 'month',
        headerName: 'Mois',
        flex: 0.6,
        minWidth: 80,
        align: 'center',
        headerAlign: 'left',
        renderCell: (params) => <Box sx={alignCellCenter}>{params.value}</Box>,
      },
      {
        field: 'week',
        headerName: 'Semaine',
        flex: 0.8,
        minWidth: 100,
        align: 'center',
        headerAlign: 'left',
        renderCell: (params) => <Box sx={alignCellCenter}>{params.value || '-'}</Box>,
      },
      {
        field: 'startedDate',
        headerName: 'Date début',
        flex: 1,
        minWidth: 120,
        align: 'center',
        headerAlign: 'left',
        renderCell: (params) => <Box sx={alignCellCenter}>{params.value}</Box>,
      },
      {
        field: 'endDate',
        headerName: 'Date fin',
        flex: 1,
        minWidth: 120,
        align: 'center',
        headerAlign: 'left',
        renderCell: (params) => <Box sx={alignCellCenter}>{params.value}</Box>,
      },
      {
        field: 'typePeriodeId',
        headerName: 'Type',
        flex: 1.2,
        minWidth: 140,
        align: 'center',
        headerAlign: 'left',
        renderCell: (params) => (
          <Box sx={alignCellCenter}>{getTypePeriodeName(params.value)}</Box>
        ),
      },
      {
        field: 'active',
        headerName: 'Statut',
        flex: 0.8,
        minWidth: 120,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCellCenter}>
            <Chip
              label={row.active ? 'Active' : 'Inactive'}
              color={row.active ? 'success' : 'default'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        flex: 1.5,
        minWidth: 240,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1} sx={alignCellCenter}>
            {hasUpdate && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(row);
                }}
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
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleActive(row);
                }}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: 110,
                }}
                disabled={togglingId === row.id}
              >
                {togglingId === row.id ? 'Patientez...' : row.active ? 'Desactiver' : 'Activer'}
              </Button>
            )}
          </Stack>
        ),
      },
    ];
  }, [hasUpdate, onEdit, onToggleActive, togglingId, getTypePeriodeName]);
};
