import React from 'react';
import {
  Menu,
  MenuItem,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Button,
  Badge,
  IconButton
} from '@mui/material';
import {
  CheckCircle,
  Assignment,
  Warning,
  Info,
  Close,
  MarkEmailRead
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = ({ anchorEl, open, onClose }) => {
  // Mock notifications - in real app, this would come from API
  const notifications = [
    {
      id: 1,
      type: 'approval',
      title: 'Activity Approved',
      message: 'Your conference participation has been approved by Dr. Smith',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      icon: <CheckCircle color="success" />,
      avatar: '/api/upload/files/faculty-avatar-1.jpg'
    },
    {
      id: 2,
      type: 'submission',
      title: 'New Activity Submitted',
      message: 'John Doe submitted a new internship activity for approval',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: false,
      icon: <Assignment color="primary" />,
      avatar: '/api/upload/files/student-avatar-1.jpg'
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Portfolio Generation Available',
      message: 'You can now generate your updated portfolio with recent activities',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      icon: <Info color="info" />,
      avatar: null
    },
    {
      id: 4,
      type: 'warning',
      title: 'Incomplete Activity',
      message: 'Please complete the documentation for your workshop activity',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      icon: <Warning color="warning" />,
      avatar: null
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (notificationId) => {
    // In real app, this would call API to mark notification as read
    console.log('Mark as read:', notificationId);
  };

  const handleMarkAllAsRead = () => {
    // In real app, this would call API to mark all notifications as read
    console.log('Mark all as read');
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'approval':
        return '#4caf50';
      case 'submission':
        return '#2196f3';
      case 'reminder':
        return '#ff9800';
      case 'warning':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 3,
        sx: {
          mt: 1.5,
          width: 380,
          maxWidth: '90vw',
          maxHeight: 500,
          overflow: 'hidden',
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {/* Header */}
      <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
            {unreadCount > 0 && (
              <Badge
                badgeContent={unreadCount}
                color="error"
                sx={{ ml: 1, '& .MuiBadge-badge': { position: 'static', transform: 'none' } }}
              />
            )}
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              startIcon={<MarkEmailRead />}
              sx={{ fontSize: '0.75rem' }}
            >
              Mark all read
            </Button>
          )}
        </Box>
      </Box>

      {/* Notifications List */}
      <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
        {notifications.length === 0 ? (
          <ListItem>
            <Box sx={{ textAlign: 'center', py: 4, width: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          </ListItem>
        ) : (
          notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  alignItems: 'flex-start',
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <ListItemAvatar>
                  <Avatar
                    src={notification.avatar}
                    sx={{
                      bgcolor: getNotificationColor(notification.type),
                      width: 40,
                      height: 40,
                    }}
                  >
                    {notification.icon}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: notification.read ? 400 : 600,
                          fontSize: '0.875rem',
                          lineHeight: 1.3,
                          pr: 1,
                        }}
                      >
                        {notification.title}
                      </Typography>
                      {!notification.read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            flexShrink: 0,
                            mt: 0.5,
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: '0.8125rem',
                          lineHeight: 1.4,
                          mt: 0.5,
                          mb: 0.5,
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '0.75rem' }}
                      >
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))
        )}
      </List>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 1 }}>
            <Button
              fullWidth
              size="small"
              onClick={() => {
                onClose();
                // Navigate to full notifications page
                window.location.href = '/notifications';
              }}
            >
              View All Notifications
            </Button>
          </Box>
        </>
      )}
    </Menu>
  );
};

export default NotificationCenter;
