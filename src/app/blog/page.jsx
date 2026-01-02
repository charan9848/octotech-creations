"use client";

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Chip, CircularProgress, Pagination, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeIn } from "@/app/variants";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [allTags, setAllTags] = useState([]);
  const postsPerPage = 9;

  useEffect(() => {
    fetchPosts();
  }, [page, selectedTag]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = `/api/blog?limit=${postsPerPage}&page=${page}`;
      if (selectedTag) {
        url += `&tag=${selectedTag}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
        setTotalPages(data.pagination.totalPages);
        
        // Extract all unique tags
        const tags = [...new Set(data.posts.flatMap(post => post.tags || []))];
        if (tags.length > 0 && allTags.length === 0) {
          setAllTags(tags);
        }
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#0B1113', 
      pt: { xs: 4, md: 6 },
      pb: 8
    }}>
        <Container maxWidth="lg">
          {/* Header */}
          <motion.div
            variants={fadeIn('up', 0.1)}
            initial="hidden"
            animate="show"
          >
            <Box textAlign="center" mb={6}>
              <Typography 
                variant="h2" 
                className="text-shine"
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 2, 
                  fontFamily: 'Eurostile, sans-serif',
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                OUR BLOG
              </Typography>
              <Typography variant="body1" sx={{ color: '#aeb4b4', maxWidth: '600px', mx: 'auto' }}>
                Insights, tutorials, and behind-the-scenes content from the world of VFX, animation, and creative production.
              </Typography>
            </Box>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            variants={fadeIn('up', 0.2)}
            initial="hidden"
            animate="show"
          >
            <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                sx={{
                  width: { xs: '100%', md: '300px' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(0, 172, 193, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#00ACC1' },
                  },
                  '& .MuiInputBase-input::placeholder': { color: '#aeb4b4' }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#aeb4b4' }} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Chip
                  label="All"
                  onClick={() => { setSelectedTag(''); setPage(1); }}
                  sx={{
                    bgcolor: !selectedTag ? '#00ACC1' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '&:hover': { bgcolor: !selectedTag ? '#00ACC1' : 'rgba(0, 172, 193, 0.3)' }
                  }}
                />
                {allTags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => { setSelectedTag(tag); setPage(1); }}
                    sx={{
                      bgcolor: selectedTag === tag ? '#00ACC1' : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '&:hover': { bgcolor: selectedTag === tag ? '#00ACC1' : 'rgba(0, 172, 193, 0.3)' }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </motion.div>

          {/* Posts Grid */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#00ACC1' }} />
            </Box>
          ) : filteredPosts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: '#aeb4b4' }}>
                No blog posts found.
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {filteredPosts.map((post, index) => (
                  <Grid item xs={12} sm={6} md={4} key={post._id}>
                    <motion.div
                      variants={fadeIn('up', 0.1 + (index * 0.05))}
                      initial="hidden"
                      animate="show"
                      style={{ height: '100%' }}
                    >
                      <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                        <Card sx={{
                          height: '100%',
                          bgcolor: '#13171a',
                          borderRadius: '16px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            border: '1px solid rgba(0, 172, 193, 0.3)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                          }
                        }}>
                          {post.coverImage && (
                            <CardMedia
                              component="img"
                              height="200"
                              image={post.coverImage}
                              alt={post.title}
                              sx={{ objectFit: 'cover' }}
                            />
                          )}
                          {!post.coverImage && (
                            <Box sx={{ 
                              height: 200, 
                              bgcolor: 'rgba(0, 172, 193, 0.1)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}>
                              <Typography variant="h3" sx={{ color: 'rgba(0, 172, 193, 0.3)' }}>
                                📝
                              </Typography>
                            </Box>
                          )}
                          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            {post.tags && post.tags.length > 0 && (
                              <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                                {post.tags.slice(0, 2).map(tag => (
                                  <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(0, 172, 193, 0.2)',
                                      color: '#00ACC1',
                                      fontSize: '0.7rem',
                                      height: '22px'
                                    }}
                                  />
                                ))}
                              </Box>
                            )}
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                color: 'white', 
                                fontWeight: 'bold', 
                                mb: 1,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {post.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#aeb4b4', 
                                mb: 2,
                                flexGrow: 1,
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {post.excerpt}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CalendarTodayIcon sx={{ fontSize: 14, color: '#666' }} />
                                <Typography variant="caption" sx={{ color: '#666' }}>
                                  {formatDate(post.publishedAt || post.createdAt)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <VisibilityIcon sx={{ fontSize: 14, color: '#666' }} />
                                <Typography variant="caption" sx={{ color: '#666' }}>
                                  {post.views || 0}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                      '& .Mui-selected': {
                        bgcolor: '#00ACC1 !important',
                      }
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
  );
}
