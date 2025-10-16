// src/components/layout/Sidebar.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { useAuthStore } from '../../store/authStore';

const drawerWidth = 260;

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  permission?: string;
}

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const menuItems: MenuItem[] = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      text: 'Users',
      icon: <PeopleIcon />,
      path: '/users',
      permission: 'USER_READ',
    },
    {
      text: 'Groupement Management',
      icon: <BusinessIcon />,
      path: '/groupement',
      permission: 'GROUPEMENT_READ',
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(148, 163, 184, 0.15)',
          background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 2,
          boxShadow: '8px 0 24px rgba(15, 23, 42, 0.55)',
        },
      }}
    >
      <Toolbar
        sx={{
          px: 3,
          py: 2,
          minHeight: 80,
          borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 42,
              height: 42,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.9), rgba(14, 165, 233, 0.65))',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)',
            }}
          >
            <DirectionsCarIcon sx={{ fontSize: 26, color: '#f8fafc' }} />
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 700, letterSpacing: 0.4, color: '#f8fafc' }}
          >
            AutoHall
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.12)' }} />
      <List
        sx={{
          mt: 1,
          px: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
        }}
      >
        {filteredMenuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname.startsWith(item.path)}
              onClick={() => navigate(item.path)}
              sx={{
                mb: 0.5,
                px: 2,
                py: 1.25,
                borderRadius: '14px',
                transition: 'all 0.2s ease',
                color: 'rgba(226, 232, 240, 0.84)',
                '&:hover': {
                  backgroundColor: 'rgba(37, 99, 235, 0.18)',
                  color: '#f8fafc',
                },
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.92), rgba(79, 70, 229, 0.75))',
                  color: '#f8fafc',
                  boxShadow: '0 12px 30px rgba(37, 99, 235, 0.35)',
                  '& .MuiListItemIcon-root': {
                    color: '#f8fafc',
                  },
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 1), rgba(59, 130, 246, 0.85))',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname.startsWith(item.path)
                    ? 'inherit'
                    : 'rgba(148, 163, 184, 0.75)',
                  }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};
