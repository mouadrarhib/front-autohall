// src/components/layout/Sidebar.tsx

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

const drawerWidth = 260;

interface MenuItem {
  title: string;
  icon: React.ReactElement;
  path: string;
}

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    { title: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { title: 'Users', icon: <PeopleIcon />, path: '/users' },
    { title: 'Permissions', icon: <SecurityIcon />, path: '/permissions' },
    { title: 'Groupements', icon: <BusinessIcon />, path: '/groupement' },
    { title: 'Marques', icon: <DirectionsCarIcon />, path: '/groupement' },
    { title: 'Objectifs', icon: <TrackChangesIcon />, path: '/objectifs' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1e293b',
          color: '#cbd5e1',
          borderRight: '1px solid rgba(148, 163, 184, 0.1)',
        },
      }}
    >
      <Toolbar
        sx={{
          backgroundColor: '#0f172a',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <DirectionsCarIcon sx={{ color: '#3b82f6', fontSize: 32 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px',
            }}
          >
            AutoHall
          </Typography>
        </Box>
      </Toolbar>

      <List sx={{ pt: 2, px: 1.5 }}>
        {menuItems.map((item) => (
          <ListItem key={`${item.path}-${item.title}`} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  borderLeft: '3px solid #3b82f6',
                  '& .MuiListItemIcon-root': {
                    color: '#3b82f6',
                  },
                  '& .MuiListItemText-primary': {
                    color: '#f1f5f9',
                    fontWeight: 600,
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(148, 163, 184, 0.1)',
                  '& .MuiListItemIcon-root': {
                    color: '#94a3b8',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? '#3b82f6' : '#64748b',
                  minWidth: 40,
                  transition: 'color 0.2s ease',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: '0.9375rem',
                  fontWeight: isActive(item.path) ? 600 : 500,
                  color: isActive(item.path) ? '#f1f5f9' : '#cbd5e1',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)', my: 2 }} />

      <Box sx={{ px: 2.5, py: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 600,
          }}
        >
          Version 1.0.0
        </Typography>
      </Box>
    </Drawer>
  );
};
