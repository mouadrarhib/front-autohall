// src/features/objectifs/useObjectifColumns.tsx

import { useMemo } from 'react';
import { IconButton, Box, Typography, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import type { GridColDef } from '@mui/x-data-grid';
import type { ObjectifView } from '../../api/endpoints/objectif.api';

interface UseObjectifColumnsArgs {
  hasUpdate: boolean;
  onEdit: (objectif: ObjectifView) => void;
}

export const useObjectifColumns = ({
  hasUpdate,
  onEdit,
}: UseObjectifColumnsArgs): GridColDef[] => {
  return useMemo<GridColDef[]>(() => {
    const createTextColumn = (
      field: keyof ObjectifView,
      headerName: string,
      flex = 1,
      minWidth = 140
    ): GridColDef => ({
      field,
      headerName,
      flex,
      minWidth,
      sortable: false,
      headerAlign: 'left',
      align: 'left',
      headerClassName: 'bold-header',
      cellClassName: 'body-cell',
      renderCell: ({ value }) => (
        <Typography
          variant="body2"
          noWrap
          sx={{ fontWeight: 500, color: 'text.primary', maxWidth: '100%' }}
        >
          {value ?? '--'}
        </Typography>
      ),
    });

    const createCurrencyColumn = (
      field: keyof ObjectifView,
      headerName: string
    ): GridColDef => ({
      field,
      headerName,
      flex: 0.95,
      minWidth: 140,
      sortable: false,
      type: 'number',
      headerAlign: 'right',
      align: 'right',
      headerClassName: 'bold-header',
      cellClassName: 'body-cell number-cell',
      renderCell: ({ value }) => (
        <Typography
          variant="body2"
          component="span"
          noWrap
          sx={{ fontWeight: 600, color: 'text.primary' }}
        >
          {typeof value === 'number'
            ? `${value.toLocaleString('fr-MA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} DH`
            : '--'}
        </Typography>
      ),
    });

    return [
      createTextColumn('groupementName', 'Groupement', 1.1, 150),
      createTextColumn('SiteName', 'Site', 1, 140),
      createTextColumn('periodeName', 'Période', 1.3, 200),
      createTextColumn('typeVenteName', 'Type Vente', 1, 150),
      createTextColumn('typeObjectifName', 'Type Objectif', 1.15, 170),
      createTextColumn('marqueName', 'Marque', 1, 140),
      createTextColumn('modeleName', 'Modèle', 1, 160),
      createTextColumn('versionName', 'Version', 1, 160),
      {
        field: 'volume',
        headerName: 'Volume',
        flex: 0.7,
        minWidth: 100,
        sortable: false,
        headerAlign: 'right',
        align: 'right',
        type: 'number',
        headerClassName: 'bold-header',
        cellClassName: 'body-cell number-cell',
        renderCell: ({ value }) => (
          <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: 'text.primary' }}>
            {value ?? '--'}
          </Typography>
        ),
      },
      createCurrencyColumn('ChiffreDaffaire', 'CA'),
      createCurrencyColumn('Marge', 'Marge'),
      {
        field: 'TauxMarge',
        headerName: 'Taux Marge',
        flex: 0.9,
        minWidth: 120,
        sortable: false,
        headerAlign: 'right',
        align: 'right',
        headerClassName: 'bold-header',
        cellClassName: 'body-cell number-cell',
        renderCell: ({ row }) => (
          <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: 'text.primary' }}>
            {`${(row.TauxMarge * 100).toFixed(2)} %`}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        headerClassName: 'bold-header',
        renderCell: (params) =>
          hasUpdate ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <Tooltip title="Modifier">
                <span>
                  <IconButton
                    onClick={() => onEdit(params.row)}
                    size="small"
                    sx={{
                      color: 'text.secondary',
                      border: '1px solid rgba(148, 163, 184, 0.24)',
                      backgroundColor: 'rgba(148, 163, 184, 0.08)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: 'warning.main',
                        backgroundColor: 'rgba(251, 191, 36, 0.18)',
                        borderColor: 'rgba(245, 158, 11, 0.4)',
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          ) : null,
      },
    ];
  }, [hasUpdate, onEdit]);
};
