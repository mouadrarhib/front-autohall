// src/components/layout/Sidebar.tsx

import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CategoryIcon from '@mui/icons-material/Category';
import LayersIcon from '@mui/icons-material/Layers';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import logo from '../../assets/logo.png';
import { useAuthStore } from '../../store/authStore';

interface MenuItem {
  title: string;
  icon: React.ReactElement;
  path?: string;
  children?: Array<{
    title: string;
    icon: React.ReactElement;
    path: string;
  }>;
}

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const menuItems: MenuItem[] = [
    { title: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { title: 'Users', icon: <PeopleIcon />, path: '/users' },
    // { title: 'Permissions', icon: <SecurityIcon />, path: '/permissions' },
    { title: 'Sites', icon: <StorefrontIcon />, path: '/sites' },
    {
      title: 'Marques',
      icon: <DirectionsCarIcon />,
      path: '/marques',
      children: [
        { title: 'Modèles', icon: <CategoryIcon />, path: '/modeles' },
        { title: 'Versions', icon: <LayersIcon />, path: '/versions' },
      ],
    },
    { title: 'Objectifs', icon: <TrackChangesIcon />, path: '/objectifs' },
  ];

  const isPathActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleNavigation = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isMenuActive = (item: MenuItem) => {
    if (item.path && isPathActive(item.path)) {
      return true;
    }
    if (item.children) {
      return item.children.some((child) => isPathActive(child.path));
    }
    return false;
  };

  const userInitials = useMemo(() => {
    if (!user) return 'AU';
    const source = user.full_name || user.username || 'AutoHall';
    return source
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 100%)',
        borderRight: '1px solid rgba(148, 163, 184, 0.2)',
        boxShadow: '0 12px 40px rgba(15, 23, 42, 0.35)',
      }}
    >
      <Toolbar sx={{ justifyContent: isCompact ? 'space-between' : 'center', px: 2 }}>
        {!isCompact && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{ 
                height: 50, 
                width: 'auto', 
                objectFit: 'contain',
                filter: 'invert(1) brightness(1.2)',
              }}
            />
          </Box>
        )}
        {isCompact && onItemClick && (
          <IconButton onClick={onItemClick} sx={{ color: '#f1f5f9' }}>
            <CloseIcon />
          </IconButton>
        )}
      </Toolbar>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.2)' }} />

      <List sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2 }}>
        {menuItems.map((item) => {
          const active = isMenuActive(item);
          const isExpanded = openMenus[item.title] ?? active;
          const hasChildren = Boolean(item.children && item.children.length > 0);

          const handleItemClick = () => {
            if (hasChildren) {
              toggleMenu(item.title);
              if (item.path) {
                handleNavigation(item.path);
              }
            } else if (item.path) {
              handleNavigation(item.path);
            }
          };

          return (
            <ListItem key={item.title} disablePadding sx={{ display: 'block', mb: 0.5 }}>
              <ListItemButton
                onClick={handleItemClick}
                selected={active && !hasChildren}
                sx={{
                  borderRadius: 2,
                  py: 1.25,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    '& .MuiListItemIcon-root': { color: '#3b82f6' },
                    '& .MuiListItemText-primary': {
                      color: '#f1f5f9',
                      fontWeight: 600,
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: active ? '#3b82f6' : '#94a3b8' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontWeight: active ? 600 : 500,
                    color: active ? '#f1f5f9' : '#cbd5e1',
                  }}
                />
                {!isCompact && hasChildren && (
                  <Box sx={{ color: '#94a3b8' }}>
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                )}
              </ListItemButton>

              {hasChildren && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children!.map((child) => {
                      const childActive = isPathActive(child.path);
                      return (
                        <ListItemButton
                          key={child.path}
                          onClick={() => handleNavigation(child.path)}
                          selected={childActive}
                          sx={{
                            pl: 7,
                            borderRadius: 2,
                            py: 0.75,
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(59, 130, 246, 0.12)',
                              '& .MuiListItemIcon-root': { color: '#3b82f6' },
                              '& .MuiListItemText-primary': {
                                color: '#f1f5f9',
                                fontWeight: 600,
                              },
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(59, 130, 246, 0.08)',
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36, color: childActive ? '#3b82f6' : '#94a3b8' }}>
                            {child.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={child.title}
                            primaryTypographyProps={{
                              fontWeight: childActive ? 600 : 500,
                              color: childActive ? '#f1f5f9' : '#cbd5e1',
                            }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.2)' }} />

      <Box sx={{ p: 2 }}>
        <Box
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!user) return;
            handleNavigation(`/users/${user.id}`);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              if (!user) return;
              handleNavigation(`/users/${user.id}`);
            }
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.35)',
            cursor: user ? 'pointer' : 'default',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': user
              ? {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 16px 36px rgba(37, 99, 235, 0.35)',
                }
              : undefined,
            outline: 'none',
          }}
        >
          <Avatar
            sx={{
              bgcolor: '#3b82f6',
              color: '#ffffff',
              width: 40,
              height: 40,
              fontWeight: 700,
            }}
          >
            {userInitials}
          </Avatar>
          {!isCompact && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#f1f5f9' }}>
                {user?.full_name || user?.username || 'Utilisateur'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                {user?.email || 'email@autohall.ma'}
              </Typography>
            </Box>
          )}
        </Box>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={async () => {
            try {
              await logout();
            } finally {
              navigate('/login', { replace: true });
            }
          }}
          sx={{
            mt: 2,
            color: '#f1f5f9',
            borderColor: 'rgba(148, 163, 184, 0.35)',
            textTransform: 'none',
            fontWeight: 600,
            justifyContent: 'flex-start',
            '&:hover': {
              borderColor: 'rgba(248, 113, 113, 0.8)',
              backgroundColor: 'rgba(248, 113, 113, 0.15)',
            },
          }}
        >
          Se deconnecter
        </Button>

        {!isCompact && (
          <Typography
            variant="caption"
            sx={{ display: 'block', textAlign: 'center', color: '#64748b', mt: 2 }}
          >
            Version 1.0.0
          </Typography>
        )}
      </Box>
    </Box>
  );
};
