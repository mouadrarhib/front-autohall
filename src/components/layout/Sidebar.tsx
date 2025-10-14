// src/components/layout/Sidebar.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Avatar,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ApartmentIcon from '@mui/icons-material/Apartment';
import { useAuthStore } from '../../store/authStore';


interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuthStore();

  const handleNavigation = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      permission: null,
    },
    {
      text: 'Users',
      icon: <PeopleIcon />,
      path: '/users',
      permission: 'USER_READ',
    },
    {
      text: 'User Sites',
      icon: <BusinessIcon />,
      path: '/user-sites',
      permission: 'USERSITE_READ',
    },
    {
      text: 'Filiales',
      icon: <AccountTreeIcon />,
      path: '/filiales',
      permission: 'FILIALE_READ',
    },
    {
      text: 'Succursales',
      icon: <ApartmentIcon />,
      path: '/succursales',
      permission: 'SUCCURSALE_READ',
    },
  ];

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        color: 'inherit',
      }}
    >
      <Toolbar
        sx={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 2,
          pt: 3,
          pb: 2,
          px: 3,
        }}
      >
        <Box>
          <Typography variant="overline" sx={{ opacity: 0.7, letterSpacing: 2 }}>
            Autohall
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            Control Center
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
          <Avatar
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.22)',
              color: 'common.white',
              fontWeight: 600,
            }}
          >
            {user?.full_name?.charAt(0) || user?.username?.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap fontWeight={600}>
              {user?.full_name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.75 }} noWrap>
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', mx: 3 }} />
      
      <List
        sx={{
          flexGrow: 1,
          mt: 1,
          px: 1,
          '& .MuiListItemIcon-root': {
            color: 'inherit',
          },
        }}
      >
        {menuItems.map((item) => {
          if (item.permission && !hasPermission(item.permission)) {
            return null;
          }

          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                  py: 1.25,
                  px: 2.5,
                  color: 'inherit',
                  transition: 'background-color 0.2s ease, transform 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    transform: 'translateX(4px)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'common.white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    },
                  },
                  '& .MuiListItemIcon-root': {
                    minWidth: 36,
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: isActive ? 600 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', mx: 3 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              mx: 1,
              mb: 2,
              borderRadius: 2,
              py: 1.25,
              px: 2.5,
              color: 'inherit',
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.18)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};
