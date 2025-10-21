// src/components/layout/Navbar.tsx
import React from 'react';
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

interface NavbarProps {
  onMenuToggle: () => void;
  showMenuButton: boolean;
  drawerWidth: number;
  isDesktop: boolean;
  title?: string;
  sidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onMenuToggle,
  showMenuButton,
  drawerWidth,
  isDesktop,
  title,
  sidebarOpen,
}) => {
  const shouldShowToggle = showMenuButton || isDesktop;
  const ToggleIcon = isDesktop && sidebarOpen ? MenuOpenIcon : MenuIcon;

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #0f172a 0%, #0b1120 55%, #1d4ed8 100%)',
        boxShadow: '0 18px 45px rgba(15, 23, 42, 0.45)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
        width: isDesktop ? `calc(100% - ${drawerWidth}px)` : '100%',
        ml: isDesktop ? `${drawerWidth}px` : 0,
        backdropFilter: 'blur(14px)',
        color: '#e2e8f0',
      }}
    >
      <Toolbar
        sx={{
          minHeight: 72,
          px: { xs: 2, md: 4 },
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          color: 'inherit',
        }}
      >
        {shouldShowToggle && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenuToggle}
            sx={{ mr: 1 }}
          >
            <ToggleIcon />
          </IconButton>
        )}
        <Box sx={{ flexGrow: 1 }}>
          {title ? (
            <Typography
              variant="h5"
              fontWeight={600}
              sx={{ color: '#f8fafc', letterSpacing: 0.2 }}
            >
              {title}
            </Typography>
          ) : null}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(37, 99, 235, 0.16)',
            px: 1.25,
            py: 0.7,
            borderRadius: 999,
            backdropFilter: 'blur(10px)',
            boxShadow: 'inset 0 1px 0 rgba(148, 163, 184, 0.2)',
            border: '1px solid rgba(37, 99, 235, 0.35)',
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
