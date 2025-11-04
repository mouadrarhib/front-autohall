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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setSidebarOpen((prev) => !prev);
    }
  };

  const drawerWidth = !isMobile && sidebarOpen ? DRAWER_WIDTH : 0;

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
        drawerWidth={drawerWidth}
        isDesktop={!isMobile}
        sidebarOpen={sidebarOpen}
      />

      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
          transition: theme.transitions.create('width', {
            duration: theme.transitions.duration.shorter,
          }),
        }}
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
            variant="persistent"
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
                background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 45%, #1d4ed8 100%)',
                color: 'common.white',
                borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                transition: theme.transitions.create('transform', {
                  duration: theme.transitions.duration.shorter,
                }),
              },
            }}
          >
            <Sidebar />
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: '72px', md: '88px' },
          minHeight: { xs: 'calc(100vh - 72px)', md: 'calc(100vh - 88px)' },
          maxHeight: { xs: 'calc(100vh - 72px)', md: 'calc(100vh - 88px)' },
          overflowY: 'auto',
          overflowX: 'hidden',
          p: { xs: 3, md: 4 },
          display: 'flex',
          justifyContent: 'center',
          scrollBehavior: 'smooth',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 1200,
            minHeight: '100%',
            pb: { xs: 6, md: 8 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
