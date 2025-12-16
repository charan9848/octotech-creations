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

  if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress sx={{ color: '#32b4de' }} /></Box>;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>Services Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          size="small"
          onClick={() => handleOpen()}
          sx={{ bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2' }, fontSize: '0.8rem' }}
        >
          Add Service
        </Button>
      </Box>

      <Grid container spacing={2}>
        {services.map((service) => (
          <Grid item xs={12} sm={6} lg={4} key={service._id}>
            <Card sx={{ 
              bgcolor: '#1a2027', 
              color: 'white', 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }
            }}>
              {service.image && (
                <Box position="relative" height={160} width="100%" sx={{ bgcolor: '#000', borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
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
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Box sx={{ color: '#32b4de' }}>
                    <IconComponent name={service.icon} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{service.title}</Typography>
                </Box>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontSize: '0.75rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {service.description}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
                  Order: {service.order}
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 1.5, pt: 0, justifyContent: 'flex-end' }}>
                <IconButton size="small" onClick={() => handleOpen(service)} sx={{ color: '#2196f3' }}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(service._id)} sx={{ color: '#f44336' }}>
                  <Delete fontSize="small" />
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
            bgcolor: '#1a2027',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
          {isEditing ? 'Edit Service' : 'Add New Service'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  label="Title"
                  fullWidth
                  size="small"
                  value={currentService.title}
                  onChange={handleTitleChange}
                  sx={{
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#2196f3' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#2196f3' },
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
                  size="small"
                  value={currentService.order}
                  onChange={(e) => setCurrentService({ ...currentService, order: parseInt(e.target.value) })}
                  sx={{
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#2196f3' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#2196f3' },
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
              rows={3}
              size="small"
              value={currentService.description}
              onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#2196f3' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#2196f3' },
                  color: 'white'
                }
              }}
            />
            
            <FormControl fullWidth size="small" sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#2196f3' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#2196f3' },
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
                      bgcolor: '#1a2027',
                      color: 'white',
                      maxHeight: 300,
                      '& .MuiMenuItem-root': {
                        fontSize: '0.85rem',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                        '&.Mui-selected': { bgcolor: 'rgba(33, 150, 243, 0.2)', '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.3)' } }
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

            <Box sx={{ border: '1px dashed rgba(255,255,255,0.3)', p: 2, borderRadius: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)' }}>
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
                  size="small"
                  startIcon={uploading ? <CircularProgress size={16} sx={{ color: '#2196f3' }} /> : <CloudUpload />}
                  disabled={uploading}
                  fullWidth
                  sx={{ 
                    height: 40, 
                    color: '#2196f3', 
                    borderColor: 'rgba(33, 150, 243, 0.5)',
                    '&:hover': { borderColor: '#2196f3', bgcolor: 'rgba(33, 150, 243, 0.1)' }
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload Image or Video'}
                </Button>
              </label>
              {currentService.image && (
                <Box mt={1.5}>
                  <Box position="relative" height={150} width="100%" sx={{ bgcolor: '#000', borderRadius: 1, overflow: 'hidden' }}>
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
                    size="small"
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
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', px: 3, py: 2 }}>
          <Button onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2' } }}>
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
