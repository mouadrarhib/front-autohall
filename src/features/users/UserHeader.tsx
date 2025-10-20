// src/features/users/UserHeader.tsx

import React from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface UserHeaderProps {
  totalUsers: number;
  activeUsers: number;
  hasCreatePermission: boolean;
  onCreate: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({
  totalUsers,
  activeUsers,
  hasCreatePermission,
  onCreate,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: { xs: 1.5, sm: 2 },
        p: { xs: 2.5, md: 3 },
        borderBottom: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(135deg, rgba(15,23,42,0.05) 0%, rgba(37,99,235,0.08) 100%)',
      }}
    >
      <Stack spacing={0.8} sx={{ width: '100%' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Users Management
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip label={`${totalUsers} utilisateurs`} size="small" sx={{ fontWeight: 600 }} />
          <Chip
            label={`${activeUsers} actifs`}
            size="small"
            color="success"
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </Stack>

      {hasCreatePermission && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreate}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: { xs: 2.5, sm: 3 },
            width: { xs: '100%', sm: 'auto' },
            boxShadow: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-2px)',
            },
          }}
        >
          Create User
        </Button>
      )}
    </Box>
  );
};
