"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress, Divider, Grid } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from 'react-hot-toast';

export default function ManageContent() {
  const [content, setContent] = useState({
    heroTitle: '',
    heroSubtitle: '',
    aboutText: '',
    contactEmail: '',
    contactPhone: '',
    instagramLink: ''
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/site-content');
      if (res.ok) {
        const data = await res.json();
        if (data.hero) {
          setContent(prev => ({ ...prev, ...data.hero }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch content", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });

      if (res.ok) {
        toast.success("Content updated successfully");
      } else {
        toast.error("Failed to update content");
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
          Manage Content
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#1a2027', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ color: '#32b4de', mb: 2 }}>
              Hero Section
            </Typography>
            <TextField
              fullWidth
              label="Hero Title"
              variant="outlined"
              value={content.heroTitle}
              onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
              sx={{ mb: 3 }}
              disabled={actionLoading}
            />
            <TextField
              fullWidth
              label="Hero Subtitle"
              variant="outlined"
              multiline
              rows={2}
              value={content.heroSubtitle}
              onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
              disabled={actionLoading}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#1a2027', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ color: '#32b4de', mb: 2 }}>
              Contact Information
            </Typography>
            <TextField
              fullWidth
              label="Contact Email"
              variant="outlined"
              value={content.contactEmail}
              onChange={(e) => setContent({ ...content, contactEmail: e.target.value })}
              sx={{ mb: 3 }}
              disabled={actionLoading}
            />
            <TextField
              fullWidth
              label="Contact Phone"
              variant="outlined"
              value={content.contactPhone}
              onChange={(e) => setContent({ ...content, contactPhone: e.target.value })}
              sx={{ mb: 3 }}
              disabled={actionLoading}
            />
            <TextField
              fullWidth
              label="Instagram Link"
              variant="outlined"
              value={content.instagramLink}
              onChange={(e) => setContent({ ...content, instagramLink: e.target.value })}
              disabled={actionLoading}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: '#1a2027', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ color: '#32b4de', mb: 2 }}>
              About Section
            </Typography>
            <TextField
              fullWidth
              label="About Text"
              variant="outlined"
              multiline
              rows={6}
              value={content.aboutText}
              onChange={(e) => setContent({ ...content, aboutText: e.target.value })}
              disabled={actionLoading}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
