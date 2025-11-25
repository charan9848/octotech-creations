"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from 'react-hot-toast';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    maxArtists: 4
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings({ maxArtists: data.maxArtists || 4 });
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success("Settings updated successfully");
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      console.error("Update error", error);
      toast.error("Error updating settings");
    } finally {
      setSaving(false);
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
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'white' }}>
        System Settings
      </Typography>

      <Paper sx={{ p: 4, bgcolor: '#1a2027', border: '1px solid rgba(255,255,255,0.05)', maxWidth: 600 }}>
        <Typography variant="h6" sx={{ mb: 3, color: '#32b4de' }}>
          Registration Limits
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Max Artists Allowed"
            type="number"
            fullWidth
            variant="outlined"
            value={settings.maxArtists}
            onChange={(e) => setSettings({ ...settings, maxArtists: parseInt(e.target.value) })}
            helperText="Set the maximum number of artist accounts that can be registered."
            InputProps={{
              sx: { color: 'white' }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255,255,255,0.7)' }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&.Mui-focused fieldset': { borderColor: '#32b4de' },
              },
              '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.5)' }
            }}
          />
        </Box>

        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{
            bgcolor: '#32b4de',
            '&:hover': { bgcolor: '#2a9ac0' },
            mt: 2
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Paper>
    </Box>
  );
}
