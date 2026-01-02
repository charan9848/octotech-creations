"use client";

import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress, IconButton, Chip, Alert, Switch, Avatar, Grid, LinearProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function ManageOurTeamContent() {
  const [content, setContent] = useState({
    title: 'OUR TEAM',
    subtitle: 'Meet the creative minds behind our projects. A blend of artists, animators, and VFX specialists dedicated to bringing your vision to life.',
    backgroundVideoUrl: '',
    hiddenArtists: [] // Array of artistid strings to hide
  });
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchContent();
    fetchArtists();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/site-content');
      if (res.ok) {
        const data = await res.json();
        if (data.ourTeam) {
          setContent(prev => ({ ...prev, ...data.ourTeam }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch content", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const fetchArtists = async () => {
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        setArtists(data);
      }
    } catch (error) {
      console.error("Failed to fetch artists", error);
    }
  };

  const toggleArtistVisibility = (artistid) => {
    setContent(prev => {
      const hiddenArtists = prev.hiddenArtists || [];
      if (hiddenArtists.includes(artistid)) {
        return { ...prev, hiddenArtists: hiddenArtists.filter(id => id !== artistid) };
      } else {
        return { ...prev, hiddenArtists: [...hiddenArtists, artistid] };
      }
    });
  };

  const isArtistVisible = (artistid) => {
    return !(content.hiddenArtists || []).includes(artistid);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    // Validate file size (100MB max for videos)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video file too large. Maximum size: 100MB');
      return;
    }

    setUploadLoading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          setContent(prev => ({ ...prev, backgroundVideoUrl: data.url }));
          toast.success('Video uploaded successfully');
        } else {
          const error = JSON.parse(xhr.responseText);
          toast.error(error.error || 'Failed to upload video');
        }
        setUploadLoading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };

      xhr.onerror = () => {
        toast.error('Error uploading video');
        setUploadLoading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    } catch (error) {
      console.error("Upload error", error);
      toast.error('Error uploading video');
      setUploadLoading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveVideo = () => {
    setContent(prev => ({ ...prev, backgroundVideoUrl: '' }));
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          section: 'ourTeam',
          ...content
        }),
      });

      if (res.ok) {
        toast.success("Our Team content updated successfully");
      } else {
        const errorData = await res.json();
        console.error("Save error response:", errorData);
        toast.error(errorData.error || "Failed to update content");
      }
    } catch (error) {
      console.error("Save error", error);
      toast.error("Error saving content");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress sx={{ color: '#32b4de' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Link href="/admin/dashboard/content">
          <IconButton sx={{ color: '#32b4de' }}>
            <ArrowBackIcon />
          </IconButton>
        </Link>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', flex: 1 }}>
          Manage Our Team Section
        </Typography>
        <Button 
          variant="contained" 
          startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={actionLoading}
          sx={{ bgcolor: '#32b4de', '&:hover': { bgcolor: '#2a9ac0' } }}
        >
          {actionLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {/* Team Members (Artists) with visibility toggles */}
      <Paper sx={{ 
        p: 3, 
        bgcolor: '#1a2027', 
        border: '1px solid rgba(255,255,255,0.05)',
        mb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <GroupIcon sx={{ color: '#32b4de', fontSize: 30 }} />
          <Box>
            <Typography variant="h6" sx={{ color: 'white' }}>
              Team Members Visibility
            </Typography>
            <Typography variant="body2" sx={{ color: '#aeb4b4' }}>
              Toggle which artists appear in the Our Team section
            </Typography>
          </Box>
        </Box>

        {artists.length === 0 ? (
          <Typography color="#aeb4b4" textAlign="center" py={2}>
            No artists registered yet
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {artists.map((artist) => (
              <Grid item xs={12} sm={6} md={4} key={artist.artistid}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: isArtistVisible(artist.artistid) ? 'rgba(50, 180, 222, 0.1)' : 'rgba(255,255,255,0.03)',
                  border: isArtistVisible(artist.artistid) ? '1px solid rgba(50, 180, 222, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.3s'
                }}>
                  <Avatar 
                    src={artist.profileImage || artist.image} 
                    alt={artist.username}
                    sx={{ width: 50, height: 50 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 500 }} noWrap>
                      {artist.username}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#aeb4b4' }}>
                      {artist.role || 'Artist'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isArtistVisible(artist.artistid) ? (
                      <VisibilityIcon sx={{ color: '#32b4de', fontSize: 20 }} />
                    ) : (
                      <VisibilityOffIcon sx={{ color: '#666', fontSize: 20 }} />
                    )}
                    <Switch
                      checked={isArtistVisible(artist.artistid)}
                      onChange={() => toggleArtistVisibility(artist.artistid)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#32b4de',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#32b4de',
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip 
            label={`${artists.filter(a => isArtistVisible(a.artistid)).length} visible`} 
            size="small" 
            sx={{ bgcolor: 'rgba(50, 180, 222, 0.2)', color: '#32b4de' }} 
          />
          <Chip 
            label={`${artists.filter(a => !isArtistVisible(a.artistid)).length} hidden`} 
            size="small" 
            sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#aeb4b4' }} 
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, bgcolor: '#1a2027', border: '1px solid rgba(255,255,255,0.05)', mb: 3 }}>
        <Typography variant="h6" sx={{ color: '#32b4de', mb: 2 }}>
          Section Text Content
        </Typography>
        <TextField
          fullWidth
          label="Section Title"
          variant="outlined"
          value={content.title}
          onChange={(e) => setContent({ ...content, title: e.target.value })}
          sx={{ mb: 3 }}
          disabled={actionLoading}
        />
        <TextField
          fullWidth
          label="Section Subtitle"
          variant="outlined"
          multiline
          rows={3}
          value={content.subtitle}
          onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
          disabled={actionLoading}
        />
      </Paper>

      <Paper sx={{ p: 3, bgcolor: '#1a2027', border: '1px solid rgba(255,255,255,0.05)' }}>
        <Typography variant="h6" sx={{ color: '#32b4de', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <VideoLibraryIcon />
          Background Video
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3, bgcolor: 'rgba(50, 180, 222, 0.1)', color: '#aeb4b4' }}>
          Upload a video to use as the background for the Our Team section. Recommended: MP4 format, max 100MB.
        </Alert>

        {content.backgroundVideoUrl ? (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ 
              position: 'relative', 
              borderRadius: 2, 
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
              mb: 2
            }}>
              <video
                src={content.backgroundVideoUrl}
                style={{ 
                  width: '100%', 
                  maxHeight: '300px', 
                  objectFit: 'cover',
                  display: 'block'
                }}
                autoPlay
                loop
                muted
                playsInline
              />
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                p: 2
              }}>
                <Chip 
                  label="Current Background Video" 
                  color="primary" 
                  size="small"
                  sx={{ bgcolor: '#32b4de' }}
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleRemoveVideo}
                disabled={actionLoading}
              >
                Remove Video
              </Button>
              <Button
                variant="outlined"
                startIcon={uploadLoading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadLoading}
                sx={{ borderColor: '#32b4de', color: '#32b4de' }}
              >
                {uploadLoading ? `Uploading... ${uploadProgress}%` : 'Replace Video'}
              </Button>
            </Box>
            {uploadLoading && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{ 
                      flex: 1, 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#32b4de',
                        borderRadius: 4
                      }
                    }} 
                  />
                  <Typography variant="body2" color="#32b4de" sx={{ minWidth: 45 }}>
                    {uploadProgress}%
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <Box 
            sx={{ 
              border: '2px dashed rgba(255,255,255,0.2)',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                borderColor: '#32b4de',
                bgcolor: 'rgba(50, 180, 222, 0.05)'
              }
            }}
            onClick={() => !uploadLoading && fileInputRef.current?.click()}
          >
            {uploadLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    size={80}
                    thickness={4}
                    sx={{ color: '#32b4de' }} 
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6" component="div" color="#32b4de">
                      {uploadProgress}%
                    </Typography>
                  </Box>
                </Box>
                <Typography color="white" variant="body1">Uploading video...</Typography>
                <Box sx={{ width: '80%', maxWidth: 300 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#32b4de',
                        borderRadius: 3
                      }
                    }} 
                  />
                </Box>
              </Box>
            ) : (
              <>
                <CloudUploadIcon sx={{ fontSize: 48, color: '#32b4de', mb: 2 }} />
                <Typography variant="h6" color="white" gutterBottom>
                  Click to upload background video
                </Typography>
                <Typography variant="body2" color="#aeb4b4">
                  MP4, WebM, or MOV • Max 100MB
                </Typography>
              </>
            )}
          </Box>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        <TextField
          fullWidth
          label="Or paste video URL directly"
          variant="outlined"
          value={content.backgroundVideoUrl}
          onChange={(e) => setContent({ ...content, backgroundVideoUrl: e.target.value })}
          placeholder="https://res.cloudinary.com/..."
          sx={{ mt: 3 }}
          disabled={actionLoading}
          helperText="You can paste a Cloudinary or any other video URL here"
        />
      </Paper>
    </Box>
  );
}
