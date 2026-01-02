"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import { toast } from 'react-hot-toast';

export default function SubscribersPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/blog/subscribers');
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      } else if (res.status === 401) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSubscriber) return;
    try {
      const res = await fetch(`/api/blog/subscribers?id=${selectedSubscriber._id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('Subscriber removed');
        setSubscribers(prev => prev.filter(s => s._id !== selectedSubscriber._id));
        setDeleteDialogOpen(false);
        setSelectedSubscriber(null);
      }
    } catch (error) {
      toast.error('Failed to remove subscriber');
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast.error('No subscribers to export');
      return;
    }
    
    const headers = ['Name', 'Email', 'Source', 'Subscribed Date'];
    const csvContent = [
      headers.join(','),
      ...subscribers.map(s => [
        `"${s.name || ''}"`,
        `"${s.email}"`,
        `"${s.source || 'comment'}"`,
        `"${new Date(s.createdAt).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `blog-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('CSV exported successfully');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredSubscribers = subscribers.filter(subscriber => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        subscriber.name?.toLowerCase().includes(query) ||
        subscriber.email?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#00ACC1' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
          Email Subscribers
          <Chip 
            label={`${subscribers.length} total`} 
            size="small" 
            sx={{ ml: 2, bgcolor: 'rgba(0, 172, 193, 0.2)', color: '#00ACC1' }} 
          />
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExportCSV}
          sx={{ bgcolor: '#00ACC1', '&:hover': { bgcolor: '#008fa1' } }}
        >
          Export CSV
        </Button>
      </Box>

      <Typography variant="body2" sx={{ color: '#aeb4b4', mb: 3 }}>
        These are email addresses collected from blog comments. Use them for newsletters and updates.
      </Typography>

      <Paper sx={{ bgcolor: '#1a1f23', borderRadius: '12px', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <TextField
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#666' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(0, 172, 193, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#00ACC1' }
              }
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>Name</TableCell>
                <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>Email</TableCell>
                <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>Source</TableCell>
                <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>Date</TableCell>
                <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ color: '#666', textAlign: 'center', py: 4, borderColor: 'rgba(255,255,255,0.1)' }}>
                    {searchQuery ? 'No matching subscribers found' : 'No subscribers yet'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber._id} sx={{ '&:hover': { bgcolor: 'rgba(0, 172, 193, 0.05)' } }}>
                    <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                      {subscriber.name || '-'}
                    </TableCell>
                    <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon sx={{ fontSize: 16, color: '#00ACC1' }} />
                        <Typography sx={{ color: '#00ACC1' }}>
                          {subscriber.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <Chip 
                        label={subscriber.source || 'comment'} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(0, 172, 193, 0.1)', 
                          color: '#00ACC1',
                          textTransform: 'capitalize'
                        }} 
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>
                      {formatDate(subscriber.createdAt)}
                    </TableCell>
                    <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <Tooltip title="Remove subscriber">
                        <IconButton 
                          size="small" 
                          onClick={() => { setSelectedSubscriber(subscriber); setDeleteDialogOpen(true); }}
                          sx={{ color: '#f44336' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { bgcolor: '#1a1f23', color: 'white' } }}
      >
        <DialogTitle>Remove Subscriber?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#aeb4b4' }}>
            Are you sure you want to remove <strong>{selectedSubscriber?.email}</strong> from the subscriber list?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#aeb4b4' }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} sx={{ color: '#f44336' }}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
