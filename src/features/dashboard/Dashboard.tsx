// src/features/dashboard/Dashboard.tsx
import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { useAuthStore } from '../../store/authStore';

export const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome back, {user?.full_name}!
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Users</Typography>
            <Typography variant="h4">0</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Vehicles</Typography>
            <Typography variant="h4">0</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Sales</Typography>
            <Typography variant="h4">0</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Revenue</Typography>
            <Typography variant="h4">$0</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
