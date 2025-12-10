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
        background: 'linear-gradient(135deg, #e8f0ff 0%, #edf5ff 50%, #dbeafe 100%)',
        boxShadow: '0 12px 32px rgba(59, 130, 246, 0.18)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.12)',
        width: isDesktop ? `calc(100% - ${drawerWidth}px)` : '100%',
        ml: isDesktop ? `${drawerWidth}px` : 0,
        backdropFilter: 'blur(14px)',
        color: '#0f172a',
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
              sx={{ color: '#0f172a', letterSpacing: 0.2 }}
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
            bgcolor: 'rgba(59, 130, 246, 0.12)',
            px: 1.25,
            py: 0.7,
            borderRadius: 999,
            backdropFilter: 'blur(10px)',
            boxShadow: 'inset 0 1px 0 rgba(148, 163, 184, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.28)',
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
