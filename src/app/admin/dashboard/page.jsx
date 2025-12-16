"use client";

import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress, Card, CardContent, List, ListItem, ListItemText, ListItemAvatar, Avatar, Button, Divider, Chip, IconButton, LinearProgress, TextField, Snackbar, Alert, Switch, FormControlLabel, InputAdornment, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useRouter } from 'next/navigation';
import PeopleIcon from '@mui/icons-material/People';
import FeedbackIcon from '@mui/icons-material/Feedback';
import EmailIcon from '@mui/icons-material/Email';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EditIcon from '@mui/icons-material/Edit';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import MemoryIcon from '@mui/icons-material/Memory';
import DnsIcon from '@mui/icons-material/Dns';
import CloudIcon from '@mui/icons-material/Cloud';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CampaignIcon from '@mui/icons-material/Campaign';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, AreaChart, Area, LineChart, Line } from 'recharts';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [growthData, setGrowthData] = useState([]);
  const [visitorData, setVisitorData] = useState([]);
  
  // New Features State
  const [note, setNote] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [systemHealth, setSystemHealth] = useState({ cpu: 0, memory: 0, storage: { usagePercent: 0, usedMB: 0, totalMB: 512 } });
  const [settings, setSettings] = useState({ maxArtists: 4, maintenanceMode: false, allowRegistrations: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  
  // Project CRUD State
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const [confirmSaveDialogOpen, setConfirmSaveDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    clientName: '',
    clientEmail: '',
    startDate: '',
    endDate: '',
    status: 'Planning',
    category: 'Other',
    budget: 0,
    artistId: ''
  });

  // Todo State
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  
  // Broadcast State
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Version State
  const [appVersion, setAppVersion] = useState('1.0');

  // Project Handlers
  const handleOpenAddProject = () => {
    setProjectForm({
      title: '',
      description: '',
      clientName: '',
      clientEmail: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      status: 'Planning',
      category: 'Other',
      budget: 0,
      artistId: stats?.allArtists?.[0]?.artistid || ''
    });
    setIsEditingProject(false);
    setProjectDialogOpen(true);
  };

  const handleOpenEditProject = (project) => {
    setProjectForm({
      title: project.title,
      description: project.description || '',
      clientName: project.clientName,
      clientEmail: project.clientEmail || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      status: project.status,
      category: project.category || 'Other',
      budget: project.budget,
      artistId: project.artistId
    });
    setCurrentProject(project);
    setIsEditingProject(true);
    setProjectDialogOpen(true);
  };

  const handleOpenDeleteProject = (project) => {
    setCurrentProject(project);
    setDeleteProjectDialogOpen(true);
  };

  const handleConfirmSave = () => {
    setConfirmSaveDialogOpen(true);
  };

  const handleSaveProject = async () => {
    setConfirmSaveDialogOpen(false);
    try {
      const url = isEditingProject ? '/api/admin/projects' : '/api/admin/projects';
      const method = isEditingProject ? 'PUT' : 'POST';
      
      const payload = isEditingProject ? {
        artistId: currentProject.artistId,
        projectIndex: currentProject.projectIndex,
        project: {
          ...projectForm,
          budget: Number(projectForm.budget)
        }
      } : {
        artistId: projectForm.artistId,
        project: {
          ...projectForm,
          budget: Number(projectForm.budget)
        }
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSnackbar({ open: true, message: `Project ${isEditingProject ? 'updated' : 'added'} successfully`, severity: 'success' });
        setProjectDialogOpen(false);
        fetchStats(); // Refresh data
      } else {
        const data = await res.json();
        setSnackbar({ open: true, message: data.error || 'Failed to save project', severity: 'error' });
      }
    } catch (error) {
      console.error('Error saving project:', error);
      setSnackbar({ open: true, message: 'An error occurred', severity: 'error' });
    }
  };

  const handleDeleteProject = async () => {
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId: currentProject.artistId,
          projectIndex: currentProject.projectIndex
        })
      });

      if (res.ok) {
        setSnackbar({ open: true, message: 'Project deleted successfully', severity: 'success' });
        setDeleteProjectDialogOpen(false);
        fetchStats(); // Refresh data
      } else {
        const data = await res.json();
        setSnackbar({ open: true, message: data.error || 'Failed to delete project', severity: 'error' });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setSnackbar({ open: true, message: 'An error occurred', severity: 'error' });
    }
  };

  useEffect(() => {
    const savedNote = localStorage.getItem('admin_note');
    if (savedNote) setNote(savedNote);

    const fetchTodos = async () => {
      try {
        const res = await fetch('/api/admin/todos');
        if (res.ok) {
          const data = await res.json();
          setTodos(data);
        }
      } catch (error) {
        console.error("Failed to fetch todos", error);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          if (data.settings) setSettings(data.settings);
          processGrowthData(data.allArtistsDates);
          processVisitorData(data.visitorStats);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSystemHealth = async () => {
      try {
        const res = await fetch('/api/admin/system-health');
        if (res.ok) {
          const data = await res.json();
          setSystemHealth(data);
        }
      } catch (error) {
        console.error("Failed to fetch system health", error);
      }
    };

    const fetchVersion = async () => {
      try {
        const res = await fetch('/api/version');
        if (res.ok) {
          const data = await res.json();
          if (data.version) setAppVersion(data.version);
        }
      } catch (error) {
        console.error("Failed to fetch version", error);
      }
    };

    fetchStats();
    fetchSystemHealth();
    fetchTodos();
    fetchVersion();
    
    // Refresh system health every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Todo Handlers
  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      const res = await fetch('/api/admin/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTodo })
      });
      if (res.ok) {
        const todo = await res.json();
        setTodos([todo, ...todos]);
        setNewTodo('');
      }
    } catch (error) {
      console.error("Failed to add todo", error);
    }
  };

  const handleToggleTodo = async (id, completed) => {
    try {
      // Optimistic update
      const updatedTodos = todos.map(t => t._id === id ? { ...t, completed: !completed } : t);
      setTodos(updatedTodos);
      
      await fetch('/api/admin/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: !completed })
      });
    } catch (error) {
      console.error("Failed to toggle todo", error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      const updatedTodos = todos.filter(t => t._id !== id);
      setTodos(updatedTodos);
      
      await fetch(`/api/admin/todos?id=${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error("Failed to delete todo", error);
    }
  };

  // Broadcast Handlers
  const handleSendBroadcast = async () => {
    if (!broadcastSubject || !broadcastMessage) {
      setSnackbar({ open: true, message: 'Subject and message required', severity: 'error' });
      return;
    }
    
    setSendingBroadcast(true);
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: broadcastSubject, message: broadcastMessage })
      });
      
      if (res.ok) {
        setSnackbar({ open: true, message: 'Broadcast sent successfully', severity: 'success' });
        setBroadcastOpen(false);
        setBroadcastSubject('');
        setBroadcastMessage('');
      } else {
        setSnackbar({ open: true, message: 'Failed to send broadcast', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error sending broadcast', severity: 'error' });
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/admin/dashboard/artists?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const processVisitorData = (stats) => {
    if (!stats) return;
    // Sort by date
    const sorted = [...stats].sort((a, b) => new Date(a.date) - new Date(b.date));
    // Take last 14 days for better visibility
    const recent = sorted.slice(-14);
    
    const chartData = recent.map(item => ({
        date: format(new Date(item.date), 'MMM dd'),
        visitors: item.count
    }));
    setVisitorData(chartData);
  };

  const processGrowthData = (dates) => {
    if (!dates) return;
    
    const monthCounts = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthCounts[key] = 0;
    }

    dates.forEach(item => {
      // Use createdAt or fallback to _id timestamp
      let date;
      if (item.createdAt) {
        date = new Date(item.createdAt);
      } else {
        // Extract timestamp from ObjectId
        const timestamp = parseInt(item._id.substring(0, 8), 16) * 1000;
        date = new Date(timestamp);
      }
      
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (monthCounts.hasOwnProperty(key)) {
        monthCounts[key]++;
      }
    });

    const chartData = Object.entries(monthCounts).map(([name, count]) => ({
      name,
      artists: count
    }));
    
    setGrowthData(chartData);
  };

  const handleMaintenanceToggle = (e) => {
    const newValue = e.target.checked;
    if (newValue) {
      // Turning ON -> Show warning
      setMaintenanceDialogOpen(true);
    } else {
      // Turning OFF -> Just do it
      handleSettingChange('maintenanceMode', false);
    }
  };

  const confirmMaintenanceMode = () => {
    handleSettingChange('maintenanceMode', true);
    setMaintenanceDialogOpen(false);
  };

  const handleSettingChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
        await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [key]: value })
        });
        setSnackbar({ open: true, message: 'Settings updated', severity: 'success' });
    } catch (error) {
        setSnackbar({ open: true, message: 'Failed to update settings', severity: 'error' });
    }
  };

  const handleSaveNote = () => {
    localStorage.setItem('admin_note', note);
    setSnackbar({ open: true, message: 'Note saved successfully', severity: 'success' });
  };

  const handleExportData = () => {
    // Prepare CSV content
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Visitors', stats?.stats?.visitors || 0],
      ['Total Artists', stats?.stats?.artists || 0],
      ['Total Feedback', stats?.stats?.feedback || 0],
      ['Total Messages', stats?.stats?.contacts || 0],
      ['System CPU', `${systemHealth.cpu}%`],
      ['System Memory', `${systemHealth.memory}%`],
      ['Storage Usage', `${systemHealth.storage?.usagePercent}%`],
      ['Export Date', format(new Date(), 'yyyy-MM-dd HH:mm:ss')]
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `admin_dashboard_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSnackbar({ open: true, message: 'Dashboard data exported as CSV', severity: 'success' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress sx={{ color: '#32b4de' }} />
      </Box>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: `₹${(stats?.stats?.revenue || 0).toLocaleString()}`, icon: <TrendingUpIcon fontSize="large" />, color: '#4caf50', trend: `${stats?.stats?.projects || 0} Projects` },
    { title: 'Total Visitors', value: stats?.stats?.visitors || 0, icon: <VisibilityIcon fontSize="large" />, color: '#9c27b0', trend: 'Live' },
    { title: 'Total Artists', value: stats?.stats?.artists || 0, icon: <PeopleIcon fontSize="large" />, color: '#32b4de', trend: '+12%' },
    { title: 'Total Feedback', value: stats?.stats?.feedback || 0, icon: <FeedbackIcon fontSize="large" />, color: '#e91e63', trend: '+5%' },
    { title: 'Messages', value: stats?.stats?.contacts || 0, icon: <EmailIcon fontSize="large" />, color: '#ff9800', trend: '+8%' },
  ];

  // Prepare data for charts
  const ratingData = stats?.ratingDistribution ? Object.entries(stats.ratingDistribution).map(([rating, count]) => ({
    name: `${rating} Stars`,
    count: count
  })) : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
            Dashboard Overview
          </Typography>
          <Chip label={`v${appVersion}`} size="small" sx={{ bgcolor: '#32b4de', color: 'white', fontWeight: 'bold' }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
           <TextField
              size="small"
              placeholder="Search artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon 
                      sx={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }} 
                      onClick={handleSearch}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&.Mui-focused fieldset': { borderColor: '#32b4de' },
                }
              }}
           />
           <Chip icon={<CheckCircleIcon sx={{ color: '#4caf50 !important' }} />} label="System Healthy" sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', border: '1px solid rgba(76, 175, 80, 0.2)' }} />
           <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }}>
             {format(new Date(), 'MMM dd, yyyy')}
           </Typography>
        </Box>
      </Box>

      {/* Top Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Paper
                sx={{
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#1a2027',
                  color: 'white',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '120px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1, flex: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5, fontSize: '1.5rem' }}>
                    {card.value}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <TrendingUpIcon sx={{ color: '#4caf50', fontSize: '0.7rem', mr: 0.5 }} />
                    <Typography variant="caption" sx={{ color: '#4caf50', fontSize: '0.65rem' }}>
                      {card.trend}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  bgcolor: `${card.color}15`, 
                  p: 1, 
                  borderRadius: '12px', 
                  color: card.color,
                  display: 'flex',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {React.cloneElement(card.icon, { sx: { fontSize: '1.8rem' } })}
                </Box>
                {/* Decorative background circle */}
                <Box sx={{
                  position: 'absolute',
                  right: -20,
                  bottom: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: `${card.color}10`,
                  zIndex: 0
                }} />
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Recent Projects Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card sx={{ bgcolor: '#1a2027', color: 'white', border: '1px solid rgba(255,255,255,0.05)' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Recent Projects</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  size="small"
                  onClick={handleOpenAddProject}
                  sx={{ bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2' }, fontSize: '0.75rem', py: 0.5 }}
                >
                  Add Project
                </Button>
              </Box>
              <TableContainer>
                <Table size="small" sx={{ minWidth: 650 }} aria-label="projects table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>Project Name</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>Artist</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>Client</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>Status</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }} align="right">Budget</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats?.recentProjectsList?.map((project, index) => (
                      <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 }, borderColor: 'rgba(255,255,255,0.1)' }}>
                        <TableCell component="th" scope="row" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                          {project.title}
                        </TableCell>
                        <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>{project.artistName}</TableCell>
                        <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>{project.clientName}</TableCell>
                        <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                          <Chip 
                            label={project.status} 
                            size="small" 
                            sx={{ 
                              bgcolor: project.status === 'Completed' ? 'rgba(76, 175, 80, 0.2)' : 
                                       project.status === 'In Progress' ? 'rgba(33, 150, 243, 0.2)' : 
                                       'rgba(255, 255, 255, 0.1)',
                              color: project.status === 'Completed' ? '#4caf50' : 
                                     project.status === 'In Progress' ? '#2196f3' : 
                                     'white'
                            }} 
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#4caf50', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>
                          ₹{project.budget?.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                          <IconButton size="small" onClick={() => handleOpenEditProject(project)} sx={{ color: '#2196f3' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleOpenDeleteProject(project)} sx={{ color: '#f44336' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!stats?.recentProjectsList || stats.recentProjectsList.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', borderColor: 'rgba(255,255,255,0.1)' }}>
                          No projects found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Quick Actions & Platform Settings */}
        <Grid item xs={12} md={3}>
           <Grid container spacing={2} direction="column">
             <Grid item>
                <Card sx={{ bgcolor: '#1a2027', color: 'white', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 'bold' }}>Quick Actions</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Link href="/admin/dashboard/content" style={{ textDecoration: 'none' }}>
                        <Button fullWidth variant="outlined" size="small" startIcon={<EditIcon />} sx={{ justifyContent: 'flex-start', color: '#32b4de', borderColor: 'rgba(50, 180, 222, 0.5)' }}>
                          Manage Content
                        </Button>
                      </Link>
                      <Link href="/admin/dashboard/artists" style={{ textDecoration: 'none' }}>
                        <Button fullWidth variant="outlined" size="small" startIcon={<PeopleIcon />} sx={{ justifyContent: 'flex-start', color: 'white', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                          View Artists
                        </Button>
                      </Link>
                      <Link href="/admin/dashboard/contacts" style={{ textDecoration: 'none' }}>
                        <Button fullWidth variant="outlined" size="small" startIcon={<EmailIcon />} sx={{ justifyContent: 'flex-start', color: 'white', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                          Messages
                        </Button>
                      </Link>
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        size="small"
                        startIcon={<CampaignIcon />} 
                        onClick={() => setBroadcastOpen(true)}
                        sx={{ justifyContent: 'flex-start', color: '#ff9800', borderColor: 'rgba(255, 152, 0, 0.5)' }}
                      >
                        Broadcast Email
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
             </Grid>

             <Grid item>
                <Card sx={{ bgcolor: '#1a2027', color: 'white', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <SettingsIcon sx={{ mr: 1, color: '#ff9800', fontSize: '1.2rem' }} /> Settings
                    </Typography>
                    
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5, fontSize: '0.75rem' }}>Max Artists</Typography>
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={settings.maxArtists}
                        onChange={(e) => handleSettingChange('maxArtists', e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            bgcolor: 'rgba(255,255,255,0.05)',
                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                          }
                        }}
                      />
                    </Box>

                    <FormControlLabel
                      control={
                        <Switch 
                          size="small"
                          checked={settings.maintenanceMode} 
                          onChange={handleMaintenanceToggle}
                          color="warning"
                        />
                      }
                      label={<Typography variant="body2" sx={{ color: settings.maintenanceMode ? '#ff9800' : 'white', fontSize: '0.75rem' }}>Maintenance</Typography>}
                    />

                    <FormControlLabel
                      control={
                        <Switch 
                          size="small"
                          checked={settings.allowRegistrations} 
                          onChange={(e) => handleSettingChange('allowRegistrations', e.target.checked)}
                          color="success"
                        />
                      }
                      label={<Typography variant="body2" sx={{ color: settings.allowRegistrations ? '#4caf50' : 'white', fontSize: '0.75rem' }}>Registrations</Typography>}
                    />
                  </CardContent>
                </Card>
             </Grid>
           </Grid>
        </Grid>

        {/* Visitor Traffic Chart */}
        <Grid item xs={12} md={4.5}>
          <Card sx={{ bgcolor: '#1a2027', color: 'white', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 'bold' }}>
                Daily Visitors (14 Days)
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 220, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={visitorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a2027', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                    <Line type="monotone" dataKey="visitors" stroke="#9c27b0" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Artist Growth Chart */}
        <Grid item xs={12} md={4.5}>
          <Card sx={{ bgcolor: '#1a2027', color: 'white', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 'bold' }}>
                Artist Growth
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 220, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="colorArtists" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#32b4de" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#32b4de" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a2027', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                    <Area type="monotone" dataKey="artists" stroke="#32b4de" fillOpacity={1} fill="url(#colorArtists)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Artists, Messages & Feedback Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Recent Artists */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#1a2027', color: 'white', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Recent Artists</Typography>
                <Link href="/admin/dashboard/artists">
                  <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}><ArrowForwardIcon fontSize="small" /></IconButton>
                </Link>
              </Box>
              <List dense>
                {stats?.recentArtists?.map((artist, index) => (
                  <ListItem key={artist._id} divider={index !== stats.recentArtists.length - 1} sx={{ borderColor: 'rgba(255,255,255,0.05)', px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#32b4de' }}>
                        {artist.username?.charAt(0).toUpperCase() || 'A'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={artist.username}
                      secondary={
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                          {artist.email}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
                {(!stats?.recentArtists || stats.recentArtists.length === 0) && (
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                    No artists found.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Messages */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#1a2027', color: 'white', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Recent Messages</Typography>
                <Link href="/admin/dashboard/contacts">
                  <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}><ArrowForwardIcon fontSize="small" /></IconButton>
                </Link>
              </Box>
              <List dense>
                {stats?.recentMessages?.map((msg, index) => (
                  <ListItem key={msg._id} divider={index !== stats.recentMessages.length - 1} sx={{ borderColor: 'rgba(255,255,255,0.05)', px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#ff9800' }}>
                        {msg.name?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={msg.name}
                      secondary={
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                          {msg.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
                {(!stats?.recentMessages || stats.recentMessages.length === 0) && (
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                    No messages found.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Feedback Ratings Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#1a2027', color: 'white', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 'bold' }}>
                Feedback Distribution
              </Typography>
              <Box sx={{ height: 250, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ratingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {ratingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a2027', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                      itemStyle={{ color: 'white' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Utilities Row */}
      <Grid container spacing={2}>
        {/* System Health */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#1a2027', color: 'white', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <SpeedIcon sx={{ mr: 1, color: '#4caf50', fontSize: '1.2rem' }} /> System Health
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>CPU Usage</Typography>
                  <Typography variant="body2" sx={{ color: '#4caf50', fontSize: '0.75rem' }}>{systemHealth.cpu}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={systemHealth.cpu} sx={{ height: 6, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#4caf50', borderRadius: 1 } }} />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>Memory (RAM)</Typography>
                  <Typography variant="body2" sx={{ color: '#2196f3', fontSize: '0.75rem' }}>{systemHealth.memory}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={systemHealth.memory} sx={{ height: 6, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#2196f3', borderRadius: 1 } }} />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>MongoDB Storage ({systemHealth.storage?.usedMB} MB)</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Text Data Only (Images on Cloudinary)</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#ff9800' }}>{systemHealth.storage?.usagePercent}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={Math.max(systemHealth.storage?.usagePercent || 0, 1)} sx={{ bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#ff9800' } }} />
              </Box>

              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Cloudinary Media ({systemHealth.cloudinary?.usedMB || 0} MB)</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Images & Videos</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#00b0ff' }}>{systemHealth.cloudinary?.usagePercent || 0}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={Math.max(systemHealth.cloudinary?.usagePercent || 0, 1)} sx={{ bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#00b0ff' } }} />
              </Box>

              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Deployment Bundle ({systemHealth.projectSize?.usedMB || 0} MB)</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>src + public (Excludes node_modules)</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ color: '#00e676' }}>{systemHealth.projectSize?.usagePercent || 0}%</Typography>
                    <Typography variant="caption" sx={{ color: '#00e676', fontSize: '0.65rem', display: 'block' }}>
                      {systemHealth.projectSize?.usagePercent < 20 ? 'Safe for Vercel' : 'Normal Usage'}
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={Math.max(systemHealth.projectSize?.usagePercent || 0, 1)} sx={{ bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#00e676' } }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Admin Task Board */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#1a2027', color: 'white', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <EditIcon sx={{ mr: 1, color: '#ffeb3b', fontSize: '1.2rem' }} /> Task Board
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Add new task..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.05)',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    }
                  }}
                />
                <IconButton onClick={handleAddTodo} sx={{ bgcolor: 'rgba(255, 235, 59, 0.1)', color: '#ffeb3b', borderRadius: 1 }}>
                  <AddIcon />
                </IconButton>
              </Box>

              <List sx={{ flexGrow: 1, overflow: 'auto', maxHeight: '300px' }}>
                {todos.map((todo) => (
                  <ListItem 
                    key={todo._id} 
                    dense
                    secondaryAction={
                      <IconButton edge="end" size="small" onClick={() => handleDeleteTodo(todo._id)} sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#f44336' } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.02)', 
                      mb: 1, 
                      borderRadius: 1,
                      borderLeft: `3px solid ${todo.completed ? '#4caf50' : '#ffeb3b'}`
                    }}
                  >
                    <Checkbox
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo._id, todo.completed)}
                      size="small"
                      sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#4caf50' } }}
                    />
                    <ListItemText 
                      primary={todo.text} 
                      sx={{ 
                        '& .MuiTypography-root': { 
                          color: todo.completed ? 'rgba(255,255,255,0.3)' : 'white',
                          textDecoration: todo.completed ? 'line-through' : 'none'
                        } 
                      }} 
                    />
                  </ListItem>
                ))}
                {todos.length === 0 && (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', mt: 4 }}>
                    No tasks yet. Add one above!
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Management */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#1a2027', color: 'white', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <StorageIcon sx={{ mr: 1, color: '#9c27b0', fontSize: '1.2rem' }} /> Data Management
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button 
                  variant="outlined"
                  size="small" 
                  startIcon={<DownloadIcon />} 
                  onClick={handleExportData}
                  sx={{ 
                    justifyContent: 'flex-start', 
                    color: '#9c27b0', 
                    borderColor: 'rgba(156, 39, 176, 0.5)',
                    '&:hover': { borderColor: '#9c27b0', bgcolor: 'rgba(156, 39, 176, 0.1)' }
                  }}
                >
                  Export Data
                </Button>
                
                <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5, fontSize: '0.75rem' }}>
                    Database Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4caf50' }} />
                    <Typography variant="body2" sx={{ color: '#4caf50', fontSize: '0.75rem' }}>Connected (MongoDB)</Typography>
                  </Box>
                </Box>

                <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5, fontSize: '0.75rem' }}>
                    Last Backup
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ fontSize: 14, color: '#4caf50' }} />
                    <Typography variant="body2" sx={{ color: 'white', fontSize: '0.75rem' }}>
                      {format(new Date(), 'MMM dd, yyyy')} (Auto)
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Project Dialog */}
      <Dialog 
        open={projectDialogOpen} 
        onClose={() => setProjectDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { bgcolor: '#1a2027', color: 'white', border: '1px solid rgba(255,255,255,0.1)' } }}
      >
        <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {isEditingProject ? 'Edit Project' : 'Add New Project'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {!isEditingProject && (
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Artist</InputLabel>
                <Select
                  value={projectForm.artistId}
                  label="Artist"
                  onChange={(e) => setProjectForm({ ...projectForm, artistId: e.target.value })}
                  sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' }, '.MuiSvgIcon-root': { color: 'white' } }}
                  MenuProps={{ PaperProps: { sx: { bgcolor: '#1a2027', color: 'white' } } }}
                >
                  {stats?.allArtists?.map((artist) => (
                    <MenuItem key={artist.artistid} value={artist.artistid} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                      {artist.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              label="Project Title"
              fullWidth
              value={projectForm.title}
              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' } }}
            />
            <TextField
              label="Client Name"
              fullWidth
              value={projectForm.clientName}
              onChange={(e) => setProjectForm({ ...projectForm, clientName: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' } }}
            />
            <TextField
              label="Client Email"
              fullWidth
              value={projectForm.clientEmail}
              onChange={(e) => setProjectForm({ ...projectForm, clientEmail: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' } }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={projectForm.startDate}
                  onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }, '& input::-webkit-calendar-picker-indicator': { filter: 'invert(1)' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={projectForm.endDate}
                  onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }, '& input::-webkit-calendar-picker-indicator': { filter: 'invert(1)' } }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Status</InputLabel>
                  <Select
                    value={projectForm.status}
                    label="Status"
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' }, '.MuiSvgIcon-root': { color: 'white' } }}
                    MenuProps={{ PaperProps: { sx: { bgcolor: '#1a2027', color: 'white' } } }}
                  >
                    {['Planning', 'In Progress', 'Completed', 'On Hold', 'Cancelled'].map((status) => (
                      <MenuItem key={status} value={status} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Budget"
                  type="number"
                  fullWidth
                  value={projectForm.budget}
                  onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' } }}
                />
              </Grid>
            </Grid>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', px: 3, py: 2 }}>
          <Button onClick={() => setProjectDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>Cancel</Button>
          <Button onClick={handleConfirmSave} variant="contained" sx={{ bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2' } }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Save Project Dialog */}
      <Dialog 
        open={confirmSaveDialogOpen} 
        onClose={() => setConfirmSaveDialogOpen(false)}
        PaperProps={{ sx: { bgcolor: '#1a2027', color: 'white', border: '1px solid rgba(255,255,255,0.1)' } }}
      >
        <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          Confirm {isEditingProject ? 'Update' : 'Add'} Project
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Are you sure you want to {isEditingProject ? 'update' : 'add'} the project "{projectForm.title}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', px: 3, py: 2 }}>
          <Button onClick={() => setConfirmSaveDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>Cancel</Button>
          <Button onClick={handleSaveProject} variant="contained" sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}>Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog 
        open={deleteProjectDialogOpen} 
        onClose={() => setDeleteProjectDialogOpen(false)}
        PaperProps={{ sx: { bgcolor: '#1a2027', color: 'white', border: '1px solid rgba(255,255,255,0.1)' } }}
      >
        <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Delete Project</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Are you sure you want to delete the project "{currentProject?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', px: 3, py: 2 }}>
          <Button onClick={() => setDeleteProjectDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>Cancel</Button>
          <Button onClick={handleDeleteProject} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Maintenance Mode Confirmation Dialog */}
      <Dialog
        open={maintenanceDialogOpen}
        onClose={() => setMaintenanceDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1a2027',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ color: '#ff9800', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon /> Enable Maintenance Mode?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
            Are you sure you want to enable Maintenance Mode?
          </DialogContentText>
          <Box sx={{ bgcolor: 'rgba(255, 152, 0, 0.1)', p: 2, borderRadius: 1, border: '1px solid rgba(255, 152, 0, 0.3)' }}>
            <Typography variant="body2" sx={{ color: '#ff9800', mb: 1, fontWeight: 'bold' }}>
              This will happen:
            </Typography>
            <List dense sx={{ p: 0 }}>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>• Public access to the website will be blocked.</Typography>
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>• Visitors will see the "Under Maintenance" page.</Typography>
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>• All registered artists will receive an email notification.</Typography>
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#4caf50' }}>• You (Admin) will still have full access.</Typography>
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setMaintenanceDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Cancel
          </Button>
          <Button 
            onClick={confirmMaintenanceMode} 
            variant="contained" 
            color="warning"
            autoFocus
          >
            Yes, Enable It
          </Button>
        </DialogActions>
      </Dialog>

      {/* Broadcast Email Dialog */}
      <Dialog
        open={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1a2027',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#ff9800', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CampaignIcon /> Broadcast to All Artists
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
            Send an email notification to all registered artists. Use this for important announcements.
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="dense"
            label="Email Subject"
            fullWidth
            variant="outlined"
            value={broadcastSubject}
            onChange={(e) => setBroadcastSubject(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&.Mui-focused fieldset': { borderColor: '#ff9800' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#ff9800' }
            }}
          />
          
          <TextField
            margin="dense"
            label="Message Body"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&.Mui-focused fieldset': { borderColor: '#ff9800' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#ff9800' }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setBroadcastOpen(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendBroadcast} 
            variant="contained" 
            color="warning"
            disabled={sendingBroadcast}
            startIcon={sendingBroadcast ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}
          >
            {sendingBroadcast ? 'Sending...' : 'Send Broadcast'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}