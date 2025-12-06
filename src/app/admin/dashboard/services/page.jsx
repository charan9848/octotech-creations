"use client";
import { useState, useEffect } from 'react';
import { 
  Box, Button, Card, CardContent, CardActions, Typography, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Grid, CircularProgress, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { Edit, Delete, Add, CloudUpload } from '@mui/icons-material';
import {
  Movie, Brush, Animation, ThreeDRotation, Home,
  ColorLens, VideoCameraBack, AutoFixHigh, Web, DesignServices,
  Camera, Mic, MusicNote, Palette, Computer, Help,
  MovieFilter, SlowMotionVideo, Timeline, Title, HomeWork
} from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';

const ICON_MAP = {
  "MovieFilter": MovieFilter, // Video Editing
  "AutoFixHigh": AutoFixHigh, // VFX
  "SlowMotionVideo": SlowMotionVideo, // Reels
  "Timeline": Timeline, // Motion Graphics
  "Title": Title, // Titles/Logo Animation
  "ThreeDRotation": ThreeDRotation, // 3D CGI
  "HomeWork": HomeWork, // Real Estate
  "Palette": Palette, // DI-Colour Grading
  
  // Keep others for flexibility
  "Movie": Movie,
  "Brush": Brush,
  "Animation": Animation,
  "Home": Home,
  "ColorLens": ColorLens,
  "VideoCameraBack": VideoCameraBack,
  "Web": Web,
  "DesignServices": DesignServices,
  "Camera": Camera,
  "Mic": Mic,
  "MusicNote": MusicNote,
  "Computer": Computer
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

export default function ServicesManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentService, setCurrentService] = useState({
    title: '',
    description: '',
    image: '',
    icon: 'Movie',
    order: 0
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get('/api/services');
      setServices(res.data);
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const t = title.toLowerCase();
    
    setCurrentService(prev => {
      let icon = prev.icon;
      
      if (t.includes('video') || t.includes('film') || t.includes('edit')) icon = 'MovieFilter';
      else if (t.includes('vfx') || t.includes('visual') || t.includes('effect')) icon = 'AutoFixHigh';
      else if (t.includes('reel') || t.includes('short') || t.includes('tiktok') || t.includes('instagram')) icon = 'SlowMotionVideo';
      else if (t.includes('motion') || t.includes('anim') || t.includes('graphic')) icon = 'Timeline';
      else if (t.includes('title') || t.includes('logo') || t.includes('text')) icon = 'Title';
      else if (t.includes('3d') || t.includes('cgi') || t.includes('render')) icon = 'ThreeDRotation';
      else if (t.includes('estate') || t.includes('home') || t.includes('house') || t.includes('property')) icon = 'HomeWork';
      else if (t.includes('color') || t.includes('grading') || t.includes('di') || t.includes('correction')) icon = 'Palette';
      else if (t.includes('web') || t.includes('site') || t.includes('app')) icon = 'Web';
      else if (t.includes('design') || t.includes('art')) icon = 'DesignServices';
      else if (t.includes('photo') || t.includes('cam') || t.includes('shoot')) icon = 'Camera';
      else if (t.includes('music') || t.includes('song') || t.includes('audio') || t.includes('sound')) icon = 'MusicNote';
      else if (t.includes('voice') || t.includes('mic') || t.includes('record')) icon = 'Mic';
      else if (t.includes('tech') || t.includes('computer') || t.includes('software') || t.includes('dev')) icon = 'Computer';

      return { ...prev, title, icon };
    });
  };

  const handleOpen = (service = null) => {
    if (service) {
      setCurrentService(service);
      setIsEditing(true);
    } else {
      setCurrentService({
        title: '',
        description: '',
        image: '',
        icon: 'Movie',
        order: services.length + 1
      });
      setIsEditing(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentService({ title: '', description: '', image: '', icon: 'Movie', order: 0 });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await axios.post('/api/upload', formData);
      setCurrentService({ ...currentService, image: res.data.url });
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await axios.put(`/api/services/${currentService._id}`, currentService);
        toast.success('Service updated');
      } else {
        await axios.post('/api/services', currentService);
        toast.success('Service created');
      }
      fetchServices();
      handleClose();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await axios.delete(`/api/services/${id}`);
      toast.success('Service deleted');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const IconComponent = ({ name }) => {
    const Icon = ICON_MAP[name] || Help;
    return <Icon />;
  };

  const isVideo = (url) => {
    return url && (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg') || url.includes('/video/upload/'));
  };

  if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="white">Services Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => handleOpen()}
          sx={{ bgcolor: '#e50914', '&:hover': { bgcolor: '#b20710' } }}
        >
          Add Service
        </Button>
      </Box>

      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} md={6} lg={4} key={service._id}>
            <Card sx={{ bgcolor: '#1e2327', color: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {service.image && (
                <Box position="relative" height={200} width="100%" bgcolor="#000">
                  {isVideo(service.image) ? (
                    <video 
                      src={service.image} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      controls 
                    />
                  ) : (
                    <Image 
                      src={service.image} 
                      alt={service.title} 
                      fill 
                      style={{ objectFit: 'cover' }} 
                    />
                  )}
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <IconComponent name={service.icon} />
                  <Typography variant="h6">{service.title}</Typography>
                </Box>
                <Typography variant="body2" color="gray" sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {service.description}
                </Typography>
                <Typography variant="caption" display="block" mt={1} color="gray">
                  Order: {service.order}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleOpen(service)} sx={{ color: '#4fc3f7' }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(service._id)} sx={{ color: '#f44336' }}>
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1e2327',
            color: 'white'
          }
        }}
      >
        <DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  label="Title"
                  fullWidth
                  value={currentService.title}
                  onChange={handleTitleChange}
                  sx={{
                    '& .MuiInputLabel-root': { color: 'gray' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#4fc3f7' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                      '&:hover fieldset': { borderColor: 'white' },
                      '&.Mui-focused fieldset': { borderColor: '#4fc3f7' },
                      color: 'white'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Order"
                  type="number"
                  fullWidth
                  value={currentService.order}
                  onChange={(e) => setCurrentService({ ...currentService, order: parseInt(e.target.value) })}
                  sx={{
                    '& .MuiInputLabel-root': { color: 'gray' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#4fc3f7' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                      '&:hover fieldset': { borderColor: 'white' },
                      '&.Mui-focused fieldset': { borderColor: '#4fc3f7' },
                      color: 'white'
                    }
                  }}
                />
              </Grid>
            </Grid>
            
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={currentService.description}
              onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
              sx={{
                '& .MuiInputLabel-root': { color: 'gray' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#4fc3f7' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                  '&:hover fieldset': { borderColor: 'white' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' },
                  color: 'white'
                }
              }}
            />
            
            <FormControl fullWidth sx={{
                '& .MuiInputLabel-root': { color: 'gray' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#4fc3f7' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                  '&:hover fieldset': { borderColor: 'white' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' },
                  color: 'white'
                },
                '& .MuiSelect-icon': { color: 'white' }
              }}>
              <InputLabel>Icon</InputLabel>
              <Select
                value={currentService.icon}
                label="Icon"
                onChange={(e) => setCurrentService({ ...currentService, icon: e.target.value })}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: '#1e2327',
                      color: 'white',
                      '& .MuiMenuItem-root': {
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                        '&.Mui-selected': { bgcolor: 'rgba(79, 195, 247, 0.2)', '&:hover': { bgcolor: 'rgba(79, 195, 247, 0.3)' } }
                      }
                    }
                  }
                }}
              >
                {ICON_OPTIONS.map((icon) => (
                  <MenuItem key={icon} value={icon}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconComponent name={icon} />
                      {icon}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box border="1px dashed rgba(255, 255, 255, 0.23)" p={3} borderRadius={2} textAlign="center">
              <input
                accept="image/*,video/*"
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="raised-button-file">
                <Button 
                  variant="outlined" 
                  component="span" 
                  startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
                  disabled={uploading}
                  fullWidth
                  sx={{ height: 50 }}
                >
                  {uploading ? 'Uploading...' : 'Upload Image or Video'}
                </Button>
              </label>
              {currentService.image && (
                <Box mt={2}>
                  <Box position="relative" height={200} width="100%" bgcolor="#000">
                    {isVideo(currentService.image) ? (
                      <video 
                        src={currentService.image} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        controls 
                      />
                    ) : (
                      <Image 
                        src={currentService.image} 
                        alt="Preview" 
                        fill 
                        style={{ objectFit: 'contain' }} 
                      />
                    )}
                  </Box>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<Delete />}
                    onClick={() => setCurrentService({ ...currentService, image: '' })}
                    sx={{ mt: 1 }}
                    fullWidth
                  >
                    Remove Media
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
