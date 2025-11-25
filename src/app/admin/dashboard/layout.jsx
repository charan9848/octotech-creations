"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import FeedbackIcon from '@mui/icons-material/Feedback';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArticleIcon from '@mui/icons-material/Article';
import Link from 'next/link';

const drawerWidth = 240;

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/artist-login'); // Redirect non-admins
    }
  }, [status, session, router]);

  if (status === 'loading' || !session || session?.user?.role !== 'admin') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#15191c', color: 'white' }}>
        <Typography>Loading Admin Dashboard...</Typography>
      </Box>
    );
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/admin/login' });
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Site Content', icon: <ArticleIcon />, path: '/admin/dashboard/content' },
    { text: 'Artists', icon: <PeopleIcon />, path: '/admin/dashboard/artists' },
    { text: 'Feedback', icon: <FeedbackIcon />, path: '/admin/dashboard/feedback' },
    { text: 'Messages', icon: <EmailIcon />, path: '/admin/dashboard/contacts' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/dashboard/settings' },
  ];

  const drawer = (
    <Box sx={{ bgcolor: '#1a2027', height: '100%', color: 'white' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" noWrap component="div" sx={{ color: '#32b4de', fontWeight: 'bold' }}>
          OCTOTECH ADMIN
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Link href={item.path} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
              <ListItemButton
                selected={pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'rgba(50, 180, 222, 0.15)',
                    borderLeft: '4px solid #32b4de',
                    '&:hover': { bgcolor: 'rgba(50, 180, 222, 0.25)' },
                  },
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                }}
              >
                <ListItemIcon sx={{ color: pathname === item.path ? '#32b4de' : '#ffffff' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  disableTypography
                  primary={
                    <Typography 
                      sx={{ 
                        color: pathname === item.path ? '#32b4de' : '#ffffff',
                        fontWeight: pathname === item.path ? 'bold' : 'medium',
                        fontSize: '1rem'
                      }}
                    >
                      {item.text}
                    </Typography>
                  }
                />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#15191c', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#1a2027',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
              Admin
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ bgcolor: '#32b4de', width: 32, height: 32 }}>A</Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  bgcolor: '#1a2027',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.1)',
                }
              }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: 'white' }} />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#1a2027' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#1a2027', borderRight: '1px solid rgba(255,255,255,0.05)' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          color: 'white',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
