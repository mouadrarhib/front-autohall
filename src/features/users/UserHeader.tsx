// src/features/users/UserHeader.tsx

import React from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

interface UserHeaderProps {
  totalUsers: number;
  activeUsers: number;
  canCreateUser: boolean;
  canExport: boolean;
  onCreate: () => void;
  onExport: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({
  totalUsers,
  activeUsers,
  canCreateUser,
  canExport,
  onCreate,
  onExport,
}) => {
  return (
    <Box
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? alpha('#1e293b', 0.4)
            : alpha('#ffffff', 0.9),
        backdropFilter: 'blur(12px)',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
      >
        {/* Left Section - Title and Description */}
        <Stack spacing={1}>
          <Typography variant="h5" fontWeight={700}>
            Users Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez vos utilisateurs et maintenez leurs permissions à jour.
          </Typography>
          
          {/* Stats */}
          <Stack direction="row" spacing={1} mt={1}>
            <Chip
              icon={<GroupIcon fontSize="small" />}
              label={`${totalUsers} Total Users`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${activeUsers} Active`}
              size="small"
              color="success"
              variant="outlined"
            />
          </Stack>
        </Stack>

        {/* Right Section - Create Button */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            startIcon={<DownloadRoundedIcon />}
            onClick={onExport}
            disabled={!canExport}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Exporter CSV
          </Button>
          {canCreateUser && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreate}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: '0 12px 28px rgba(37, 99, 235, 0.25)',
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              Nouvel utilisateur
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};
