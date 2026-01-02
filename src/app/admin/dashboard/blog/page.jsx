"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, IconButton, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ArticleIcon from '@mui/icons-material/Article';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function ManageBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, post: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.post) return;
    
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/blog/${deleteDialog.post.slug}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        toast.success("Blog post deleted successfully");
        setPosts(prev => prev.filter(p => p.slug !== deleteDialog.post.slug));
        setDeleteDialog({ open: false, post: null });
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Delete error", error);
      toast.error("Error deleting post");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress sx={{ color: '#32b4de' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ArticleIcon sx={{ fontSize: 40, color: '#32b4de' }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
            Blog Management
          </Typography>
        </Box>
        <Link href="/admin/dashboard/blog/new">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: '#32b4de',
              '&:hover': { bgcolor: '#2a9bc4' }
            }}
          >
            New Post
          </Button>
        </Link>
      </Box>

      <Paper sx={{ p: 3, bgcolor: '#13171a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
            sx={{
              maxWidth: '400px',
              '& .MuiOutlinedInput-root': {
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.05)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(50, 180, 222, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#32b4de' },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#666' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ p: 2, bgcolor: 'rgba(50, 180, 222, 0.1)', borderRadius: '8px', minWidth: '120px' }}>
            <Typography variant="h4" sx={{ color: '#32b4de', fontWeight: 'bold' }}>
              {posts.length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#aeb4b4' }}>Total Posts</Typography>
          </Box>
          <Box sx={{ p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px', minWidth: '120px' }}>
            <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
              {posts.filter(p => p.status === 'published').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#aeb4b4' }}>Published</Typography>
          </Box>
          <Box sx={{ p: 2, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: '8px', minWidth: '120px' }}>
            <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
              {posts.filter(p => p.status === 'draft').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#aeb4b4' }}>Drafts</Typography>
          </Box>
        </Box>

        {/* Table */}
        {filteredPosts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <ArticleIcon sx={{ fontSize: 60, color: '#333', mb: 2 }} />
            <Typography sx={{ color: '#aeb4b4' }}>
              {searchQuery ? 'No posts found matching your search.' : 'No blog posts yet. Create your first post!'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>Title</TableCell>
                  <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>Status</TableCell>
                  <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>Views</TableCell>
                  <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>Date</TableCell>
                  <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post._id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                    <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 500 }}>{post.title}</Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>/{post.slug}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <Chip
                        label={post.status}
                        size="small"
                        sx={{
                          bgcolor: post.status === 'published' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                          color: post.status === 'published' ? '#4caf50' : '#ff9800',
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>
                      {post.views || 0}
                    </TableCell>
                    <TableCell sx={{ color: '#aeb4b4', borderColor: 'rgba(255,255,255,0.1)' }}>
                      {formatDate(post.publishedAt || post.createdAt)}
                    </TableCell>
                    <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }} align="right">
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <IconButton size="small" sx={{ color: '#32b4de' }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Link>
                      <Link href={`/admin/dashboard/blog/edit/${post.slug}`}>
                        <IconButton size="small" sx={{ color: '#ff9800' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Link>
                      <IconButton 
                        size="small" 
                        sx={{ color: '#f44336' }}
                        onClick={() => setDeleteDialog({ open: true, post })}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, post: null })}
        PaperProps={{
          sx: { bgcolor: '#1a1f23', color: 'white' }
        }}
      >
        <DialogTitle>Delete Blog Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "<strong>{deleteDialog.post?.title}</strong>"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, post: null })}
            sx={{ color: '#aeb4b4' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            disabled={deleteLoading}
            sx={{ color: '#f44336' }}
          >
            {deleteLoading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
