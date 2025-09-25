import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Chip,
  Avatar
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  CheckCircle,
  Assessment,
  People,
  Person,
  School,
  BarChart,
  Settings,
  Help
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasRole } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    if (onItemClick) onItemClick();
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const items = [];

    // Dashboard (all users)
    if (hasRole('student')) {
      items.push({
        text: 'Dashboard',
        icon: <Dashboard />,
        path: '/dashboard/student',
        badge: null
      });
    } else if (hasRole('faculty')) {
      items.push({
        text: 'Dashboard',
        icon: <Dashboard />,
        path: '/dashboard/faculty',
        badge: null
      });
    } else if (hasRole('admin')) {
      items.push({
        text: 'Dashboard',
        icon: <Dashboard />,
        path: '/dashboard/admin',
        badge: null
      });
    }

    // Activities (all users)
    items.push({
      text: 'Activities',
      icon: <Assignment />,
      path: '/activities',
      badge: null
    });

    // Approvals (faculty and admin only)
    if (hasRole(['faculty', 'admin'])) {
      items.push({
        text: 'Pending Approvals',
        icon: <CheckCircle />,
        path: '/approvals',
        badge: '3' // This would come from API
      });
    }

    // Reports (all users)
    items.push({
      text: 'Reports',
      icon: <Assessment />,
      path: '/reports',
      badge: null
    });

    // User Management (admin only)
    if (hasRole('admin')) {
      items.push({
        text: 'User Management',
        icon: <People />,
        path: '/users',
        badge: null
      });
    }

    return items;
  };

  const navigationItems = getNavigationItems();

  const getRoleColor = (role) => {
    switch (role) {
      case 'student':
        return '#4caf50';
      case 'faculty':
        return '#ff9800';
      case 'admin':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student':
        return <School />;
      case 'faculty':
        return <Person />;
      case 'admin':
        return <Settings />;
      default:
        return <Person />;
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            <School />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Student Hub
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Smart Learning Platform
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <Divider />

      {/* User Info */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Avatar
            src={user?.profileImage?.url}
            sx={{ 
              width: 36, 
              height: 36,
              bgcolor: getRoleColor(user?.role)
            }}
          >
            {user?.firstName?.[0]}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {user?.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.studentId || user?.employeeId || user?.email}
            </Typography>
          </Box>
        </Box>
        
        <Chip
          icon={getRoleIcon(user?.role)}
          label={user?.role?.toUpperCase()}
          size="small"
          sx={{
            bgcolor: getRoleColor(user?.role),
            color: 'white',
            fontWeight: 500,
            '& .MuiChip-icon': {
              color: 'white'
            }
          }}
        />
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 2,
                minHeight: 48,
                '&.Mui-selected': {
                  bgcolor: 'rgba(102, 126, 234, 0.12)',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                  '&:hover': {
                    bgcolor: 'rgba(102, 126, 234, 0.16)',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.08)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 600 : 500,
                  fontSize: '0.875rem',
                }}
              />
              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  color="error"
                  sx={{ 
                    height: 20, 
                    fontSize: '0.75rem',
                    minWidth: 20
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Bottom Navigation */}
      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleNavigation('/profile')}
            selected={isActive('/profile')}
            sx={{
              borderRadius: 2,
              minHeight: 44,
              '&.Mui-selected': {
                bgcolor: 'rgba(102, 126, 234, 0.12)',
                color: 'primary.main',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Person />
            </ListItemIcon>
            <ListItemText
              primary="Profile"
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            sx={{
              borderRadius: 2,
              minHeight: 44,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Help />
            </ListItemIcon>
            <ListItemText
              primary="Help & Support"
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
