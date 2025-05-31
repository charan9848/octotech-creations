"use client";
import { 
  Box, 
  Typography, 
  IconButton, 
  Badge, 
  Popover, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Chip,
  Button,
  Divider
} from "@mui/material";
import { useState, useEffect } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationCenter() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notify = useNotifications();

  // Load notifications from localStorage on component mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('dashboard_notifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.read).length);
    }
  }, []);

  // Save notifications to localStorage whenever notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('dashboard_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Add new notification
  const addNotification = (type, message, action = null, item = null) => {
    const newNotification = {
      id: Date.now(),
      type,
      message,
      action,
      item,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep only 20 most recent
    setUnreadCount(prev => prev + 1);

    // Also show toast notification
    switch (type) {
      case 'success':
        notify.success(message);
        break;
      case 'error':
        notify.error(message);
        break;
      case 'warning':
        notify.warning(message);
        break;
      case 'info':
        notify.info(message);
        break;
      default:
        notify.info(message);
    }
  };

  // Expose addNotification globally
  useEffect(() => {
    window.addDashboardNotification = addNotification;
    return () => {
      delete window.addDashboardNotification;
    };
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // Mark all as read when opening
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('dashboard_notifications');
    notify.info('All notifications cleared');
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#f44336' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'info':
        return <InfoIcon sx={{ color: '#00a1e0' }} />;
      default:
        return <InfoIcon sx={{ color: '#00a1e0' }} />;
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: '#fff',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#f44336',
              color: 'white'
            }
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            backgroundColor: '#1a1e23',
            border: '1px solid #2a2e33',
            borderRadius: 2,
            width: 350,
            maxHeight: 500,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #2a2e33' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
              Notifications
            </Typography>
            {notifications.length > 0 && (
              <Button
                size="small"
                startIcon={<ClearAllIcon />}
                onClick={clearAllNotifications}
                sx={{
                  color: '#00a1e0',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 161, 224, 0.1)'
                  }
                }}
              >
                Clear All
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsIcon sx={{ color: '#666', fontSize: 48, mb: 2 }} />
              <Typography variant="body2" sx={{ color: '#ccc' }}>
                No notifications yet
              </Typography>
              <Typography variant="caption" sx={{ color: '#999', mt: 1, display: 'block' }}>
                You'll see notifications here when actions are performed
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      px: 2,
                      backgroundColor: notification.read ? 'transparent' : 'rgba(0, 161, 224, 0.05)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getIcon(notification.type)}
                    </ListItemIcon>                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ color: '#fff', mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                      }                      secondary={
                        <span 
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginTop: '8px' 
                          }}
                        >
                          <Typography component="span" variant="caption" sx={{ color: '#999' }}>
                            {formatTime(notification.timestamp)}
                          </Typography>
                          <Chip
                            label={notification.type}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              backgroundColor: 
                                notification.type === 'success' ? 'rgba(76, 175, 80, 0.2)' :
                                notification.type === 'error' ? 'rgba(244, 67, 54, 0.2)' :
                                notification.type === 'warning' ? 'rgba(255, 152, 0, 0.2)' :
                                'rgba(0, 161, 224, 0.2)',
                              color: 
                                notification.type === 'success' ? '#4caf50' :
                                notification.type === 'error' ? '#f44336' :
                                notification.type === 'warning' ? '#ff9800' :
                                '#00a1e0'
                            }}
                          />
                        </span>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && (
                    <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                  )}
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}
