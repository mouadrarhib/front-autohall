// src/components/guards/RoleGuard.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useRoles, type RoleName } from '../../hooks/useRoles';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: RoleName[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  fallback,
  redirectTo,
}) => {
  const { hasAnyRole } = useRoles();

  if (!hasAnyRole(roles)) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    // Default access denied UI
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          px: 3,
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Accès Refusé
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          Veuillez contacter votre administrateur si vous pensez qu'il s'agit d'une erreur.
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.history.back()}
          sx={{ textTransform: 'none' }}
        >
          Retour
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};
