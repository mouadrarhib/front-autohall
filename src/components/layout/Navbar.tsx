// src/components/layout/Navbar.tsx
import React from 'react';
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

interface NavbarProps {
  onMenuToggle: () => void;
  showMenuButton: boolean;
  drawerWidth: number;
  isDesktop: boolean;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onMenuToggle,
  showMenuButton,
  drawerWidth,
  isDesktop,
  title,
}) => {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #38bdf8 100%)',
        boxShadow: '0 16px 40px rgba(30, 64, 175, 0.35)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        width: isDesktop ? `calc(100% - ${drawerWidth}px)` : '100%',
        ml: isDesktop ? `${drawerWidth}px` : 0,
        backdropFilter: 'blur(12px)',
      }}
    >
      <Toolbar
        sx={{
          minHeight: 72,
          px: { xs: 2, md: 4 },
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {showMenuButton && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenuToggle}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Box sx={{ flexGrow: 1 }}>
          {title ? (
            <Typography variant="h5" fontWeight={600}>
              {title}
            </Typography>
          ) : null}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(255, 255, 255, 0.12)',
            px: 1.5,
            py: 0.75,
            borderRadius: 999,
            backdropFilter: 'blur(8px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          <IconButton color="inherit" size="small">
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
          <IconButton color="inherit" size="small">
            <NotificationsNoneIcon fontSize="small" />
          </IconButton>
          <IconButton color="inherit" size="small">
            <SettingsOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
