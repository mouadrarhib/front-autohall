// src/components/layout/DashboardLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Drawer, useTheme, useMediaQuery } from '@mui/material';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const DRAWER_WIDTH = 260;

export const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f1f5f9 0%, #ffffff 45%)',
      }}
    >
      <Navbar
        onMenuToggle={handleDrawerToggle}
        showMenuButton={isMobile}
        drawerWidth={DRAWER_WIDTH}
        isDesktop={!isMobile}
      />

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
                background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #1d4ed8 100%)',
                color: 'common.white',
              },
            }}
          >
            <Sidebar onItemClick={() => setMobileOpen(false)} />
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
                background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 45%, #1d4ed8 100%)',
                color: 'common.white',
                borderRight: '1px solid rgba(255, 255, 255, 0.12)',
              },
            }}
            open
          >
            <Sidebar />
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 3, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: '72px', md: '88px' },
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 1200 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
