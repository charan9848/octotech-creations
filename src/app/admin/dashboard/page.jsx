"use client";

import { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress, Card, CardContent, List, ListItem, ListItemText, ListItemAvatar, Avatar, Button, Divider, Chip, IconButton } from '@mui/material';
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
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, AreaChart, Area, LineChart, Line } from 'recharts';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [growthData, setGrowthData] = useState([]);
  const [visitorData, setVisitorData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          processGrowthData(data.allArtistsDates);
          processVisitorData(data.visitorStats);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress sx={{ color: '#32b4de' }} />
      </Box>
    );
  }

  const statCards = [
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
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
          Dashboard Overview
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
           <Chip icon={<CheckCircleIcon sx={{ color: '#4caf50 !important' }} />} label="System Healthy" sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', border: '1px solid rgba(76, 175, 80, 0.2)' }} />
           <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }}>
             {format(new Date(), 'MMM dd, yyyy')}
           </Typography>
        </Box>
      </Box>

      {/* Top Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#1a2027',
                  color: 'white',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '140px'
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                    {card.value}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUpIcon sx={{ color: '#4caf50', fontSize: '0.8rem', mr: 0.5 }} />
                    <Typography variant="caption" sx={{ color: '#4caf50' }}>
                      {card.trend}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  bgcolor: `${card.color}20`, 
                  p: 1.5, 
                  borderRadius: '50%', 
                  color: card.color,
                  display: 'flex',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {card.icon}
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

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Quick Actions & System Health */}
        <Grid item xs={12} md={3}>
           <Grid container spacing={3} direction="column">
             <Grid item>
                <Card sx={{ bgcolor: '#1a2027', color: 'white', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Quick Actions</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Link href="/admin/dashboard/content" style={{ textDecoration: 'none' }}>
                        <Button fullWidth variant="outlined" startIcon={<EditIcon />} sx={{ justifyContent: 'flex-start', color: '#32b4de', borderColor: 'rgba(50, 180, 222, 0.5)' }}>
                          Manage Site Content
                        </Button>
                      </Link>
                      <Link href="/admin/dashboard/artists" style={{ textDecoration: 'none' }}>
                        <Button fullWidth variant="outlined" startIcon={<PeopleIcon />} sx={{ justifyContent: 'flex-start', color: 'white', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                          View All Artists
                        </Button>
                      </Link>
                      <Link href="/admin/dashboard/contacts" style={{ textDecoration: 'none' }}>
                        <Button fullWidth variant="outlined" startIcon={<EmailIcon />} sx={{ justifyContent: 'flex-start', color: 'white', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                          Check Messages
                        </Button>
                      </Link>
                    </Box>
                  </CardContent>
                </Card>
             </Grid>
           </Grid>
        </Grid>

        {/* Visitor Traffic Chart */}
        <Grid item xs={12} md={5}>
          <Card sx={{ bgcolor: '#1a2027', color: 'white', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Daily Visitors (Last 14 Days)
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 250, width: '100%' }}>
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
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#1a2027', color: 'white', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Artist Growth
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 250, width: '100%' }}>
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

      <Grid container spacing={3}>
        {/* Recent Artists */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#1a2027', color: 'white', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Recent Artists</Typography>
                <Link href="/admin/dashboard/artists">
                  <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}><ArrowForwardIcon /></IconButton>
                </Link>
              </Box>
              <List>
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
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Recent Messages</Typography>
                <Link href="/admin/dashboard/contacts">
                  <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}><ArrowForwardIcon /></IconButton>
                </Link>
              </Box>
              <List>
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
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
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
    </Box>
  );
}