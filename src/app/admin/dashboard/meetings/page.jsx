'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  InputAdornment,
  Autocomplete,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Checkbox
} from '@mui/material';
import {
  VideoCall,
  Person,
  Email,
  CalendarMonth,
  AccessTime,
  Timer,
  Subject,
  Message,
  Send,
  ContentCopy,
  OpenInNew,
  Refresh,
  Delete
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function ScheduleMeetingPage() {
  const [artists, setArtists] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 30,
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const durations = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
  ];

  // Fetch artists on load
  useEffect(() => {
    fetchArtists();
    fetchMeetings();
  }, []);

  const fetchArtists = async () => {
    try {
      const response = await fetch('/api/admin/artists');
      const data = await response.json();
      // API returns array directly, not { artists: [...] }
      if (Array.isArray(data)) {
        setArtists(data);
      } else if (data.artists) {
        setArtists(data.artists);
      }
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      setLoadingArtists(false);
    }
  };

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/admin/schedule-meeting');
      const data = await response.json();
      if (data.meetings) {
        setMeetings(data.meetings);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoadingMeetings(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedArtists.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one artist',
        severity: 'error'
      });
      return;
    }

    if (!formData.date || !formData.time) {
      setSnackbar({
        open: true,
        message: 'Please select date and time',
        severity: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      // Send meeting invite to all selected artists
      const results = await Promise.all(
        selectedArtists.map(artist =>
          fetch('/api/admin/schedule-meeting', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              artistId: artist._id,
              artistName: artist.name,
              artistEmail: artist.email,
              ...formData
            })
          }).then(res => res.json())
        )
      );

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        setSnackbar({
          open: true,
          message: `Meeting scheduled for ${successCount} artist(s)!${failCount > 0 ? ` (${failCount} failed)` : ''}`,
          severity: failCount > 0 ? 'warning' : 'success'
        });
        
        // Reset form
        setSelectedArtists([]);
        setFormData({
          date: '',
          time: '',
          duration: 30,
          subject: '',
          message: ''
        });
        
        // Refresh meetings list
        fetchMeetings();
      } else {
        throw new Error('Failed to schedule meeting for all artists');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: 'Link copied to clipboard!',
      severity: 'success'
    });
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!confirm('Are you sure you want to delete this meeting? This will also cancel the Google Calendar event.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/schedule-meeting?id=${meetingId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Meeting deleted successfully!',
          severity: 'success'
        });
        fetchMeetings();
      } else {
        throw new Error(data.error || 'Failed to delete meeting');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <VideoCall sx={{ fontSize: 40, color: '#00a1e0' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff' }}>
              Schedule Meeting
            </Typography>
            <Typography variant="body2" sx={{ color: '#888' }}>
              Create Google Meet and send invitation to artists
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Schedule Form */}
          <Grid item xs={12} lg={6}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonth sx={{ color: '#00a1e0' }} />
                  New Meeting
                </Typography>

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    {/* Artist Selection - Multiple */}
                    <Grid item xs={12}>
                      <Autocomplete
                        multiple
                        options={artists}
                        getOptionLabel={(option) => `${option.name} (${option.email})`}
                        value={selectedArtists}
                        onChange={(e, newValue) => setSelectedArtists(newValue)}
                        loading={loadingArtists}
                        disableCloseOnSelect
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Artists"
                            placeholder="Add more artists..."
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  <InputAdornment position="start">
                                    <Person sx={{ color: '#00a1e0' }} />
                                  </InputAdornment>
                                  {params.InputProps.startAdornment}
                                </>
                              )
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                color: '#fff',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                '&:hover fieldset': { borderColor: '#00a1e0' },
                                '&.Mui-focused fieldset': { borderColor: '#00a1e0' }
                              },
                              '& .MuiInputLabel-root': { color: '#888' },
                              '& .MuiInputLabel-root.Mui-focused': { color: '#00a1e0' },
                              '& .MuiChip-root': { bgcolor: 'rgba(0,161,224,0.2)', color: '#fff' }
                            }}
                          />
                        )}
                        renderOption={(props, option, { selected }) => (
                          <li {...props} key={option._id}>
                            <Checkbox
                              checked={selected}
                              sx={{ color: '#00a1e0', '&.Mui-checked': { color: '#00a1e0' } }}
                            />
                            <Box>
                              <Typography sx={{ fontWeight: 600 }}>{option.name}</Typography>
                              <Typography variant="caption" sx={{ color: '#666' }}>
                                {option.email}
                              </Typography>
                            </Box>
                          </li>
                        )}
                      />
                    </Grid>

                    {/* Date */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="date"
                        name="date"
                        label="Date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: today }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarMonth sx={{ color: '#00a1e0' }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: '#fff',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                            '&:hover fieldset': { borderColor: '#00a1e0' },
                            '&.Mui-focused fieldset': { borderColor: '#00a1e0' }
                          },
                          '& .MuiInputLabel-root': { color: '#888' },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#00a1e0' }
                        }}
                      />
                    </Grid>

                    {/* Time */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="time"
                        name="time"
                        label="Time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccessTime sx={{ color: '#00a1e0' }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: '#fff',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                            '&:hover fieldset': { borderColor: '#00a1e0' },
                            '&.Mui-focused fieldset': { borderColor: '#00a1e0' }
                          },
                          '& .MuiInputLabel-root': { color: '#888' },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#00a1e0' }
                        }}
                      />
                    </Grid>

                    {/* Duration */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        select
                        name="duration"
                        label="Duration"
                        value={formData.duration}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Timer sx={{ color: '#00a1e0' }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: '#fff',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                            '&:hover fieldset': { borderColor: '#00a1e0' },
                            '&.Mui-focused fieldset': { borderColor: '#00a1e0' }
                          },
                          '& .MuiInputLabel-root': { color: '#888' },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#00a1e0' },
                          '& .MuiSvgIcon-root': { color: '#fff' }
                        }}
                      >
                        {durations.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* Subject */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="subject"
                        label="Meeting Subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="e.g., Portfolio Review, Project Discussion"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Subject sx={{ color: '#00a1e0' }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: '#fff',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                            '&:hover fieldset': { borderColor: '#00a1e0' },
                            '&.Mui-focused fieldset': { borderColor: '#00a1e0' }
                          },
                          '& .MuiInputLabel-root': { color: '#888' },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#00a1e0' }
                        }}
                      />
                    </Grid>

                    {/* Message */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        name="message"
                        label="Message (Optional)"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Add a message to include in the invitation email..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                              <Message sx={{ color: '#00a1e0' }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: '#fff',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                            '&:hover fieldset': { borderColor: '#00a1e0' },
                            '&.Mui-focused fieldset': { borderColor: '#00a1e0' }
                          },
                          '& .MuiInputLabel-root': { color: '#888' },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#00a1e0' }
                        }}
                      />
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                        sx={{
                          py: 1.5,
                          background: 'linear-gradient(90deg, #00a1e0 0%, #00d9ff 100%)',
                          fontWeight: 600,
                          fontSize: '1rem',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #0091c7 0%, #00c4e6 100%)'
                          },
                          '&.Mui-disabled': {
                            background: 'rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.3)'
                          }
                        }}
                      >
                        {loading ? 'Scheduling...' : 'Schedule Meeting & Send Invite'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Meetings */}
          <Grid item xs={12} lg={6}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3,
              height: '100%'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VideoCall sx={{ color: '#00a1e0' }} />
                    Recent Meetings
                  </Typography>
                  <IconButton onClick={fetchMeetings} sx={{ color: '#00a1e0' }}>
                    <Refresh />
                  </IconButton>
                </Box>

                {loadingMeetings ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: '#00a1e0' }} />
                  </Box>
                ) : meetings.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ color: '#888' }}>No meetings scheduled yet</Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ bgcolor: 'rgba(0,0,0,0.5)', color: '#888', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Artist</TableCell>
                          <TableCell sx={{ bgcolor: 'rgba(0,0,0,0.5)', color: '#888', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Date & Time</TableCell>
                          <TableCell sx={{ bgcolor: 'rgba(0,0,0,0.5)', color: '#888', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Status</TableCell>
                          <TableCell sx={{ bgcolor: 'rgba(0,0,0,0.5)', color: '#888', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {meetings.slice(0, 10).map((meeting) => {
                          const meetingDate = new Date(`${meeting.date}T${meeting.time}`);
                          const isPast = meetingDate < new Date();
                          
                          return (
                            <TableRow key={meeting._id}>
                              <TableCell sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {meeting.artistName}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#888' }}>
                                    {meeting.subject || 'Meeting'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <Typography variant="body2">
                                  {new Date(meeting.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#888' }}>
                                  {meeting.time}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <Chip
                                  size="small"
                                  label={isPast ? 'Completed' : 'Upcoming'}
                                  sx={{
                                    bgcolor: isPast ? 'rgba(255,255,255,0.1)' : 'rgba(0, 161, 224, 0.2)',
                                    color: isPast ? '#888' : '#00d9ff',
                                    fontSize: '0.7rem'
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                  {meeting.meetLink && meeting.meetLink.startsWith('https://') ? (
                                    <>
                                      <Tooltip title="Copy Link">
                                        <IconButton size="small" onClick={() => copyToClipboard(meeting.meetLink)}>
                                          <ContentCopy sx={{ fontSize: 16, color: '#00a1e0' }} />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Open Meet">
                                        <IconButton size="small" component="a" href={meeting.meetLink} target="_blank">
                                          <OpenInNew sx={{ fontSize: 16, color: '#00a1e0' }} />
                                        </IconButton>
                                      </Tooltip>
                                    </>
                                  ) : (
                                    <Tooltip title={meeting.calendarError || 'Meet link not available'}>
                                      <Typography variant="caption" sx={{ color: '#ff9800', cursor: 'help' }}>
                                        No link
                                      </Typography>
                                    </Tooltip>
                                  )}
                                  <Tooltip title="Delete Meeting">
                                    <IconButton size="small" onClick={() => handleDeleteMeeting(meeting._id)}>
                                      <Delete sx={{ fontSize: 16, color: '#ff5252' }} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Setup Instructions */}
        <Card sx={{
          mt: 4,
          background: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          borderRadius: 3
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: '#ffc107', mb: 2 }}>
              ⚙️ Setup Required for Google Meet Integration
            </Typography>
            <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
              Add these environment variables to enable automatic Google Meet link creation:
            </Typography>
            <Box component="pre" sx={{ 
              bgcolor: 'rgba(0,0,0,0.3)', 
              p: 2, 
              borderRadius: 1, 
              overflow: 'auto',
              fontSize: '0.8rem',
              color: '#00d9ff'
            }}>
{`GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri
GOOGLE_REFRESH_TOKEN=your_refresh_token`}
            </Box>
            <Typography variant="caption" sx={{ color: '#888', display: 'block', mt: 1 }}>
              Without these, meetings will still be scheduled and emails sent, but without auto-generated Meet links.
            </Typography>
          </CardContent>
        </Card>
      </motion.div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
