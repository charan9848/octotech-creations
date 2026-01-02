"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Box, Typography, Paper, TextField, Button, CircularProgress, IconButton, Chip, FormControl, Select, MenuItem, LinearProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: '',
    tags: [],
    status: 'draft'
  });
  const [originalSlug, setOriginalSlug] = useState('');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (params.slug) {
      fetchPost();
    }
  }, [params.slug]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/blog/${params.slug}`);
      if (res.ok) {
        const data = await res.json();
        setPost({
          title: data.title || '',
          slug: data.slug || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          coverImage: data.coverImage || '',
          tags: data.tags || [],
          status: data.status || 'draft'
        });
        setOriginalSlug(data.slug);
      } else {
        toast.error('Post not found');
        router.push('/admin/dashboard/blog');
      }
    } catch (error) {
      console.error("Fetch error", error);
      toast.error('Error loading post');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !post.tags.includes(newTag.trim())) {
      setPost(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image too large. Maximum size: 10MB');
      return;
    }

    setUploadLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

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
          setPost(prev => ({ ...prev, coverImage: data.url }));
          toast.success('Cover image uploaded');
        } else {
          toast.error('Failed to upload image');
        }
        setUploadLoading(false);
        setUploadProgress(0);
      };

      xhr.onerror = () => {
        toast.error('Error uploading image');
        setUploadLoading(false);
        setUploadProgress(0);
      };

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    } catch (error) {
      console.error("Upload error", error);
      toast.error('Error uploading image');
      setUploadLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async (status = post.status) => {
    if (!post.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!post.content.trim()) {
      toast.error('Content is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/blog/${originalSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...post,
          status,
          newSlug: post.slug !== originalSlug ? post.slug : undefined,
          excerpt: post.excerpt || post.content.substring(0, 160) + '...'
        })
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Post updated successfully!');
        if (data.slug && data.slug !== originalSlug) {
          setOriginalSlug(data.slug);
        }
        router.push('/admin/dashboard/blog');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to save post');
      }
    } catch (error) {
      console.error("Save error", error);
      toast.error('Error saving post');
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Link href="/admin/dashboard/blog">
          <IconButton sx={{ color: '#32b4de' }}>
            <ArrowBackIcon />
          </IconButton>
        </Link>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', flex: 1 }}>
          Edit Blog Post
        </Typography>
        <Button
          variant="outlined"
          onClick={() => handleSave('draft')}
          disabled={saving}
          sx={{
            borderColor: '#666',
            color: '#aeb4b4',
            '&:hover': { borderColor: '#888' }
          }}
        >
          Save as Draft
        </Button>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={() => handleSave('published')}
          disabled={saving}
          sx={{
            bgcolor: '#4caf50',
            '&:hover': { bgcolor: '#43a047' }
          }}
        >
          {post.status === 'published' ? 'Update' : 'Publish'}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Main Content */}
        <Paper sx={{ flex: 2, p: 3, bgcolor: '#13171a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <TextField
            label="Title"
            value={post.title}
            onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
            fullWidth
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(50, 180, 222, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#32b4de' },
              },
              '& .MuiInputLabel-root': { color: '#aeb4b4' }
            }}
          />

          <TextField
            label="Slug (URL)"
            value={post.slug}
            onChange={(e) => setPost(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
            fullWidth
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(50, 180, 222, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#32b4de' },
              },
              '& .MuiInputLabel-root': { color: '#aeb4b4' }
            }}
            helperText={`URL: /blog/${post.slug || 'your-post-slug'}`}
            FormHelperTextProps={{ sx: { color: '#666' } }}
          />

          <TextField
            label="Excerpt (optional)"
            value={post.excerpt}
            onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
            fullWidth
            multiline
            rows={2}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(50, 180, 222, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#32b4de' },
              },
              '& .MuiInputLabel-root': { color: '#aeb4b4' }
            }}
            helperText="Short summary for previews."
            FormHelperTextProps={{ sx: { color: '#666' } }}
          />

          <TextField
            label="Content"
            value={post.content}
            onChange={(e) => setPost(prev => ({ ...prev, content: e.target.value }))}
            fullWidth
            multiline
            rows={15}
            placeholder="Write your blog post content here..."
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                fontFamily: 'monospace',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(50, 180, 222, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#32b4de' },
              },
              '& .MuiInputLabel-root': { color: '#aeb4b4' }
            }}
          />
        </Paper>

        {/* Sidebar */}
        <Paper sx={{ flex: 1, p: 3, bgcolor: '#13171a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', height: 'fit-content' }}>
          {/* Cover Image */}
          <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
            Cover Image
          </Typography>
          
          {post.coverImage ? (
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Box
                component="img"
                src={post.coverImage}
                alt="Cover"
                sx={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
              <IconButton
                onClick={() => setPost(prev => ({ ...prev, coverImage: '' }))}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: '#f44336',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ) : (
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: '2px dashed rgba(255,255,255,0.2)',
                borderRadius: '8px',
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                mb: 2,
                '&:hover': { borderColor: '#32b4de' }
              }}
            >
              {uploadLoading ? (
                <Box>
                  <CircularProgress size={30} sx={{ color: '#32b4de', mb: 1 }} />
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{ 
                      mt: 1,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': { bgcolor: '#32b4de' }
                    }} 
                  />
                  <Typography variant="caption" sx={{ color: '#aeb4b4', mt: 1 }}>
                    {uploadProgress}%
                  </Typography>
                </Box>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 40, color: '#666', mb: 1 }} />
                  <Typography sx={{ color: '#aeb4b4' }}>Click to upload cover image</Typography>
                </>
              )}
            </Box>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />

          {/* Tags */}
          <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold', mb: 2, mt: 3 }}>
            Tags
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {post.tags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                sx={{
                  bgcolor: 'rgba(50, 180, 222, 0.2)',
                  color: '#32b4de',
                  '& .MuiChip-deleteIcon': { color: '#32b4de' }
                }}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Add tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(50, 180, 222, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#32b4de' },
                }
              }}
            />
            <IconButton onClick={handleAddTag} sx={{ color: '#32b4de' }}>
              <AddIcon />
            </IconButton>
          </Box>

          {/* Status */}
          <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold', mb: 2, mt: 3 }}>
            Status
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={post.status}
              onChange={(e) => setPost(prev => ({ ...prev, status: e.target.value }))}
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(50, 180, 222, 0.5)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#32b4de' },
                '& .MuiSvgIcon-root': { color: 'white' }
              }}
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
            </Select>
          </FormControl>
        </Paper>
      </Box>
    </Box>
  );
}
