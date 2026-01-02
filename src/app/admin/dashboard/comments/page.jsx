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
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Avatar,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import { toast } from 'react-hot-toast';

export default function CommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComment, setSelectedComment] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await fetch('/api/blog/comments');
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      } else if (res.status === 401) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch('/api/blog/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: id, status: 'approved' })
      });
      if (res.ok) {
        toast.success('Comment approved');
        setComments(prev => prev.map(c => c._id === id ? { ...c, status: 'approved' } : c));
      }
    } catch (error) {
      toast.error('Failed to approve comment');
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch('/api/blog/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: id, status: 'rejected' })
      });
      if (res.ok) {
        toast.success('Comment rejected');
        setComments(prev => prev.map(c => c._id === id ? { ...c, status: 'rejected' } : c));
      }
    } catch (error) {
      toast.error('Failed to reject comment');
    }
  };

  const handleDelete = async () => {
    if (!selectedComment) return;
    try {
      const res = await fetch(`/api/blog/comments?id=${selectedComment._id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('Comment deleted');
        setComments(prev => prev.filter(c => c._id !== selectedComment._id));
        setDeleteDialogOpen(false);
        setSelectedComment(null);
      }
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const filteredComments = comments.filter(comment => {
    // Filter by tab
    if (tabValue === 1 && comment.status !== 'pending') return false;
    if (tabValue === 2 && comment.status !== 'approved') return false;
    if (tabValue === 3 && comment.status !== 'rejected') return false;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        comment.name?.toLowerCase().includes(query) ||
        comment.email?.toLowerCase().includes(query) ||
        comment.comment?.toLowerCase().includes(query) ||
        comment.postSlug?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const pendingCount = comments.filter(c => c.status === 'pending').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#00ACC1' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
          Blog Comments
          {pendingCount > 0 && (
            <Chip 
              label={`${pendingCount} pending`} 
              size="small" 
              color="warning" 
              sx={{ ml: 2 }} 
            />
          )}
        </Typography>
      </Box>

      <Paper sx={{ bgcolor: '#1a1f23', borderRadius: '12px', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, v) => setTabValue(v)}
            sx={{
              '& .MuiTab-root': { color: '#aeb4b4' },
              '& .Mui-selected': { color: '#00ACC1' },
              '& .MuiTabs-indicator': { bgcolor: '#00ACC1' }
            }}
          >
            <Tab label={`All (${comments.length})`} />
            <Tab label={`Pending (${comments.filter(c => c.status === 'pending').length})`} />
            <Tab label={`Approved (${comments.filter(c => c.status === 'approved').length})`} />
            <Tab label={`Rejected (${comments.filter(c => c.status === 'rejected').length})`} />
          </Tabs>
        </Box>

        <Box sx={{ p: 2 }}>
          <TextField
            placeholder="Search comments..."
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
                <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>Author</TableCell>
                <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>Comment</TableCell>
                <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>Post</TableCell>
                <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>Date</TableCell>
                <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>Status</TableCell>
                <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredComments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ color: '#666', textAlign: 'center', py: 4, borderColor: 'rgba(255,255,255,0.1)' }}>
                    No comments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredComments.map((comment) => (
                  <TableRow key={comment._id} sx={{ '&:hover': { bgcolor: 'rgba(0, 172, 193, 0.05)' } }}>
                    <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#00ACC1', fontSize: '0.875rem' }}>
                          {getInitials(comment.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            {comment.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {comment.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)', maxWidth: 300 }}>
                      <Typography noWrap title={comment.comment}>
                        {comment.comment}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#00ACC1', borderColor: 'rgba(255,255,255,0.1)' }}>
                      {comment.postSlug}
                    </TableCell>
                    <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>
                      {formatDate(comment.createdAt)}
                    </TableCell>
                    <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <Chip 
                        label={comment.status} 
                        size="small" 
                        color={getStatusColor(comment.status)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View">
                          <IconButton 
                            size="small" 
                            onClick={() => { setSelectedComment(comment); setViewDialogOpen(true); }}
                            sx={{ color: '#00ACC1' }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {comment.status !== 'approved' && (
                          <Tooltip title="Approve">
                            <IconButton 
                              size="small" 
                              onClick={() => handleApprove(comment._id)}
                              sx={{ color: '#4caf50' }}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {comment.status !== 'rejected' && (
                          <Tooltip title="Reject">
                            <IconButton 
                              size="small" 
                              onClick={() => handleReject(comment._id)}
                              sx={{ color: '#ff9800' }}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            onClick={() => { setSelectedComment(comment); setDeleteDialogOpen(true); }}
                            sx={{ color: '#f44336' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#1a1f23', color: 'white' } }}
      >
        <DialogTitle>Comment Details</DialogTitle>
        <DialogContent>
          {selectedComment && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: '#00ACC1' }}>
                  {getInitials(selectedComment.name)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedComment.name}</Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>{selectedComment.email}</Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                On post: <span style={{ color: '#00ACC1' }}>{selectedComment.postSlug}</span>
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                {formatDate(selectedComment.createdAt)}
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#13171a', borderRadius: '8px' }}>
                <Typography sx={{ color: '#aeb4b4', lineHeight: 1.8 }}>
                  {selectedComment.comment}
                </Typography>
              </Paper>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={selectedComment.status} 
                  color={getStatusColor(selectedComment.status)}
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
          {selectedComment?.status !== 'approved' && (
            <Button 
              onClick={() => { handleApprove(selectedComment._id); setViewDialogOpen(false); }}
              sx={{ color: '#4caf50' }}
            >
              Approve
            </Button>
          )}
          {selectedComment?.status !== 'rejected' && (
            <Button 
              onClick={() => { handleReject(selectedComment._id); setViewDialogOpen(false); }}
              sx={{ color: '#ff9800' }}
            >
              Reject
            </Button>
          )}
          <Button onClick={() => setViewDialogOpen(false)} sx={{ color: '#aeb4b4' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { bgcolor: '#1a1f23', color: 'white' } }}
      >
        <DialogTitle>Delete Comment?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#aeb4b4' }}>
            Are you sure you want to delete this comment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#aeb4b4' }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} sx={{ color: '#f44336' }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
