"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Divider, Switch, FormControlLabel } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { toast } from 'react-hot-toast';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cleaningMessages, setCleaningMessages] = useState(false);
  const [sendingDeployNotification, setSendingDeployNotification] = useState(false);
  const [deployVersion, setDeployVersion] = useState('');
  const [deployNotes, setDeployNotes] = useState('');
  const [settings, setSettings] = useState({
    maxArtists: 4,
    chatAutoDeleteDays: 0, // 0 = disabled, otherwise number of days
    autoApproveComments: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings({ 
          maxArtists: data.maxArtists || 4,
          chatAutoDeleteDays: data.chatAutoDeleteDays || 0,
          autoApproveComments: data.autoApproveComments || false
        });
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

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Typography variant="h6" sx={{ mb: 3, color: '#32b4de' }}>
          Chat Settings
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Auto-delete messages after</InputLabel>
            <Select
              value={settings.chatAutoDeleteDays}
              label="Auto-delete messages after"
              onChange={(e) => setSettings({ ...settings, chatAutoDeleteDays: e.target.value })}
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#32b4de' },
                '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' }
              }}
            >
              <MenuItem value={0}>Never (Manual cleanup only)</MenuItem>
              <MenuItem value={1}>1 day</MenuItem>
              <MenuItem value={3}>3 days</MenuItem>
              <MenuItem value={7}>7 days</MenuItem>
              <MenuItem value={14}>14 days</MenuItem>
              <MenuItem value={30}>30 days</MenuItem>
            </Select>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1 }}>
              Messages older than this will be automatically deleted to save storage space.
            </Typography>
          </FormControl>
        </Box>

        <Button
          variant="outlined"
          startIcon={cleaningMessages ? <CircularProgress size={20} color="inherit" /> : <DeleteSweepIcon />}
          onClick={async () => {
            setCleaningMessages(true);
            try {
              const res = await fetch('/api/messages?clearAll=true', { method: 'DELETE' });
              if (res.ok) {
                toast.success('All chat messages deleted');
              } else {
                toast.error('Failed to delete messages');
              }
            } catch (error) {
              toast.error('Error deleting messages');
            } finally {
              setCleaningMessages(false);
            }
          }}
          disabled={cleaningMessages}
          sx={{
            color: '#f44336',
            borderColor: 'rgba(244, 67, 54, 0.5)',
            '&:hover': { borderColor: '#f44336', bgcolor: 'rgba(244, 67, 54, 0.1)' },
            mb: 3
          }}
        >
          {cleaningMessages ? 'Deleting...' : 'Delete All Chat Messages Now'}
        </Button>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Typography variant="h6" sx={{ mb: 3, color: '#32b4de' }}>
          Blog Settings
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.autoApproveComments}
                onChange={(e) => setSettings({ ...settings, autoApproveComments: e.target.checked })}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#32b4de',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#32b4de',
                  },
                }}
              />
            }
            label={
              <Box>
                <Typography sx={{ color: 'white' }}>Auto-approve Comments</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  If enabled, new comments will be automatically approved and visible.
                </Typography>
              </Box>
            }
          />
        </Box>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Typography variant="h6" sx={{ mb: 3, color: '#32b4de' }}>
          Deployment Notification
        </Typography>

        <Box sx={{ mb: 2 }}>
          <TextField
            label="Version Number"
            placeholder="e.g., v2.1.0"
            fullWidth
            variant="outlined"
            size="small"
            value={deployVersion}
            onChange={(e) => setDeployVersion(e.target.value)}
            InputProps={{ sx: { color: 'white' } }}
            InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&.Mui-focused fieldset': { borderColor: '#32b4de' },
              }
            }}
          />
          <TextField
            label="What's New (Release Notes)"
            placeholder="Describe the new features or fixes..."
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            size="small"
            value={deployNotes}
            onChange={(e) => setDeployNotes(e.target.value)}
            InputProps={{ sx: { color: 'white' } }}
            InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&.Mui-focused fieldset': { borderColor: '#32b4de' },
              }
            }}
          />
        </Box>

        <Button
          variant="outlined"
          startIcon={sendingDeployNotification ? <CircularProgress size={20} color="inherit" /> : <RocketLaunchIcon />}
          onClick={async () => {
            if (!deployVersion.trim()) {
              toast.error('Please enter a version number');
              return;
            }
            setSendingDeployNotification(true);
            try {
              const res = await fetch('/api/admin/deploy-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ version: deployVersion, notes: deployNotes })
              });
              const data = await res.json();
              if (res.ok) {
                toast.success(`Deployment notification sent to ${data.sentTo} artists!`);
                setDeployVersion('');
                setDeployNotes('');
              } else {
                toast.error(data.error || 'Failed to send notification');
              }
            } catch (error) {
              toast.error('Error sending notification');
            } finally {
              setSendingDeployNotification(false);
            }
          }}
          disabled={sendingDeployNotification}
          sx={{
            color: '#4caf50',
            borderColor: 'rgba(76, 175, 80, 0.5)',
            '&:hover': { borderColor: '#4caf50', bgcolor: 'rgba(76, 175, 80, 0.1)' },
            mb: 3
          }}
        >
          {sendingDeployNotification ? 'Sending...' : 'Send Deployment Notification to All Artists'}
        </Button>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

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
