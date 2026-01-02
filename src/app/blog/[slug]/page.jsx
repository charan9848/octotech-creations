"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Box, Container, Typography, Chip, CircularProgress, Divider, Avatar, IconButton, TextField, Button, Paper, Card, CardMedia, CardContent } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeIn } from "@/app/variants";
import { toast } from 'react-hot-toast';

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Likes state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', comment: '', honeypot: '' });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  
  // Recent posts state
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    if (params.slug) {
      fetchPost();
      fetchComments();
      checkIfLiked();
      fetchRecentPosts();
    }
  }, [params.slug]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/blog/${params.slug}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
        setLikeCount(data.likes || 0);
      } else {
        setError('Post not found');
      }
    } catch (error) {
      console.error("Failed to fetch post", error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/blog/${params.slug}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to fetch comments", error);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      const res = await fetch('/api/blog?limit=5');
      if (res.ok) {
        const data = await res.json();
        // Filter out current post
        setRecentPosts(data.posts.filter(p => p.slug !== params.slug).slice(0, 4));
      }
    } catch (error) {
      console.error("Failed to fetch recent posts", error);
    }
  };

  const checkIfLiked = () => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    setLiked(likedPosts.includes(params.slug));
  };

  const handleLike = async () => {
    if (liked || liking) return;
    setLiking(true);
    try {
      const res = await fetch(`/api/blog/${params.slug}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLikeCount(data.likes);
        setLiked(true);
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        likedPosts.push(params.slug);
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
        toast.success('Thanks for the like!');
      }
    } catch (error) {
      console.error("Like error", error);
    } finally {
      setLiking(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentForm.name.trim() || !commentForm.email.trim() || !commentForm.comment.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/blog/${params.slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm)
      });
      if (res.ok) {
        toast.success('Comment submitted! It will appear after approval.');
        setCommentForm({ name: '', email: '', comment: '', honeypot: '' });
        setShowCommentForm(false);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to submit comment');
      }
    } catch (error) {
      console.error("Comment error", error);
      toast.error('Error submitting comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatCommentDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return formatDate(dateString);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const stringToColor = (string) => {
    if (!string) return '#00ACC1';
    let hash = 0;
    for (let i = 0; i < string.length; i++) { hash = string.charCodeAt(i) + ((hash << 5) - hash); }
    const colors = ['#00ACC1', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#009688', '#4CAF50', '#FF9800', '#FF5722'];
    return colors[Math.abs(hash) % colors.length];
  };

  // Simple markdown-like rendering (basic)
  const renderContent = (content) => {
    if (!content) return null;
    
    // Split content by paragraphs and render
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Handle headers
      if (paragraph.startsWith('### ')) {
        return (
          <Typography key={index} variant="h5" sx={{ color: 'white', fontWeight: 'bold', mt: 4, mb: 2 }}>
            {paragraph.replace('### ', '')}
          </Typography>
        );
      }
      if (paragraph.startsWith('## ')) {
        return (
          <Typography key={index} variant="h4" sx={{ color: 'white', fontWeight: 'bold', mt: 4, mb: 2 }}>
            {paragraph.replace('## ', '')}
          </Typography>
        );
      }
      if (paragraph.startsWith('# ')) {
        return (
          <Typography key={index} variant="h3" sx={{ color: 'white', fontWeight: 'bold', mt: 4, mb: 2 }}>
            {paragraph.replace('# ', '')}
          </Typography>
        );
      }
      
      // Handle lists
      if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
        const items = paragraph.split('\n').filter(item => item.trim());
        return (
          <Box key={index} component="ul" sx={{ color: '#aeb4b4', pl: 3, my: 2 }}>
            {items.map((item, i) => (
              <li key={i} style={{ marginBottom: '8px' }}>
                {item.replace(/^[-*]\s/, '')}
              </li>
            ))}
          </Box>
        );
      }
      
      // Handle code blocks
      if (paragraph.startsWith('```')) {
        const code = paragraph.replace(/```\w*\n?/g, '').replace(/```$/, '');
        return (
          <Box key={index} sx={{ 
            bgcolor: 'rgba(0,0,0,0.5)', 
            p: 2, 
            borderRadius: '8px', 
            my: 2,
            overflow: 'auto'
          }}>
            <pre style={{ margin: 0, color: '#00ACC1', fontFamily: 'monospace' }}>
              {code}
            </pre>
          </Box>
        );
      }
      
      // Regular paragraphs
      return (
        <Typography key={index} variant="body1" sx={{ color: '#aeb4b4', lineHeight: 1.8, mb: 2 }}>
          {paragraph}
        </Typography>
      );
    });
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#0B1113', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#00ACC1' }} />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#0B1113', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
          {error || 'Post not found'}
        </Typography>
        <Link href="/blog">
          <Typography sx={{ color: '#00ACC1', textDecoration: 'underline' }}>
            ← Back to Blog
          </Typography>
        </Link>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0B1113', pt: { xs: 4, md: 6 }, pb: 8 }}>
        {/* Cover Image */}
        {post.coverImage && (
          <Box sx={{ 
            width: '100%', 
            height: { xs: '250px', md: '400px' }, 
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box
              component="img"
              src={post.coverImage}
              alt={post.title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <Box sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(transparent, #0B1113)'
            }} />
          </Box>
        )}

        <Container maxWidth="lg" sx={{ mt: post.coverImage ? -8 : 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Main Content */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 66%' }, minWidth: 0 }}>
              <motion.div
                variants={fadeIn('up', 0.1)}
                initial="hidden"
                animate="show"
              >
                {/* Back Button */}
                <Link href="/blog">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, color: '#00ACC1' }}>
                    <ArrowBackIcon />
                    <Typography>Back to Blog</Typography>
                  </Box>
                </Link>

            {/* Title */}
            <Typography 
              variant="h3" 
              sx={{ 
                color: 'white', 
                fontWeight: 'bold', 
                mb: 3,
                fontFamily: 'Eurostile, sans-serif',
                fontSize: { xs: '1.75rem', md: '2.5rem' }
              }}
            >
              {post.title}
            </Typography>

            {/* Meta Info */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 3, 
              mb: 4, 
              pb: 4, 
              borderBottom: '1px solid rgba(255,255,255,0.1)' 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {post.author === 'Octotech Creations' ? (
                  <Avatar 
                    src="/favicon-96x96.png" 
                    sx={{ width: 32, height: 32 }}
                    alt="Octotech Creations"
                  />
                ) : (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#00ACC1' }}>
                    <PersonIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                )}
                <Typography sx={{ color: '#aeb4b4' }}>{post.author}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon sx={{ fontSize: 18, color: '#666' }} />
                <Typography sx={{ color: '#aeb4b4' }}>
                  {formatDate(post.publishedAt || post.createdAt)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VisibilityIcon sx={{ fontSize: 18, color: '#666' }} />
                <Typography sx={{ color: '#aeb4b4' }}>{post.views || 0} views</Typography>
              </Box>
              <IconButton onClick={handleShare} sx={{ color: '#00ACC1', ml: 'auto' }}>
                <ShareIcon />
              </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ mb: 3 }}>
              {renderContent(post.content)}
            </Box>

            {/* Like and Comment Buttons */}
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              py: 2, 
              borderTop: '1px solid rgba(255,255,255,0.1)', 
              borderBottom: '1px solid rgba(255,255,255,0.1)', 
              mb: 2 
            }}>
              <Button 
                onClick={handleLike} 
                disabled={liked || liking} 
                startIcon={liked ? <FavoriteIcon sx={{ color: '#f44336' }} /> : <FavoriteBorderIcon sx={{ color: 'white' }} />} 
                sx={{ 
                  color: liked ? '#f44336' : 'white', 
                  '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' },
                  '&.Mui-disabled': { color: '#f44336' },
                  minWidth: 'auto',
                  px: 1.5
                }}
              >
                {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
              </Button>
              <Button 
                onClick={() => setShowCommentForm(!showCommentForm)} 
                startIcon={<ChatBubbleOutlineIcon sx={{ color: 'white' }} />} 
                sx={{ 
                  color: 'white', 
                  '&:hover': { bgcolor: 'rgba(0, 172, 193, 0.1)' },
                  minWidth: 'auto',
                  px: 1.5
                }}
              >
                {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
              </Button>
            </Box>

            {/* Comment Form */}
            {showCommentForm && (
              <Paper sx={{ p: 2, bgcolor: '#13171a', borderRadius: '12px', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>Leave a Comment</Typography>
                <form onSubmit={handleSubmitComment}>
                  {/* Honeypot field - hidden from users */}
                  <TextField 
                    value={commentForm.honeypot} 
                    onChange={(e) => setCommentForm(prev => ({ ...prev, honeypot: e.target.value }))} 
                    sx={{ position: 'absolute', left: '-9999px' }} 
                    tabIndex={-1} 
                    autoComplete="off" 
                  />
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField 
                      label="Your Name" 
                      value={commentForm.name} 
                      onChange={(e) => setCommentForm(prev => ({ ...prev, name: e.target.value }))} 
                      required 
                      fullWidth 
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          color: 'white', 
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, 
                          '&:hover fieldset': { borderColor: 'rgba(0, 172, 193, 0.5)' }, 
                          '&.Mui-focused fieldset': { borderColor: '#00ACC1' } 
                        }, 
                        '& .MuiInputLabel-root': { color: '#aeb4b4' } 
                      }} 
                    />
                    <TextField 
                      label="Your Email" 
                      type="email" 
                      value={commentForm.email} 
                      onChange={(e) => setCommentForm(prev => ({ ...prev, email: e.target.value }))} 
                      required 
                      fullWidth 
                      helperText="We'll never share your email" 
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          color: 'white', 
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, 
                          '&:hover fieldset': { borderColor: 'rgba(0, 172, 193, 0.5)' }, 
                          '&.Mui-focused fieldset': { borderColor: '#00ACC1' } 
                        }, 
                        '& .MuiInputLabel-root': { color: '#aeb4b4' }, 
                        '& .MuiFormHelperText-root': { color: '#666' } 
                      }} 
                    />
                  </Box>
                  <TextField 
                    label="Your Comment" 
                    value={commentForm.comment} 
                    onChange={(e) => setCommentForm(prev => ({ ...prev, comment: e.target.value }))} 
                    required 
                    fullWidth 
                    multiline 
                    rows={3} 
                    inputProps={{ maxLength: 1000 }} 
                    helperText={`${commentForm.comment.length}/1000`} 
                    sx={{ 
                      mb: 2, 
                      '& .MuiOutlinedInput-root': { 
                        color: 'white', 
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, 
                        '&:hover fieldset': { borderColor: 'rgba(0, 172, 193, 0.5)' }, 
                        '&.Mui-focused fieldset': { borderColor: '#00ACC1' } 
                      }, 
                      '& .MuiInputLabel-root': { color: '#aeb4b4' }, 
                      '& .MuiFormHelperText-root': { color: '#666' } 
                    }} 
                  />
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={submittingComment} 
                    endIcon={submittingComment ? <CircularProgress size={16} color="inherit" /> : <SendIcon />} 
                    sx={{ bgcolor: '#00ACC1', '&:hover': { bgcolor: '#008fa1' } }}
                  >
                    Submit Comment
                  </Button>
                </form>
              </Paper>
            )}

            {/* Comments List */}
            {comments.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
                  Comments ({comments.length})
                </Typography>
                {comments.map((comment, index) => (
                  <Box 
                    key={comment._id} 
                    sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      mb: 3, 
                      pb: 3, 
                      borderBottom: index < comments.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' 
                    }}
                  >
                    <Avatar sx={{ bgcolor: stringToColor(comment.name) }}>
                      {getInitials(comment.name)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                          {comment.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {formatCommentDate(comment.createdAt)}
                        </Typography>
                      </Box>
                      <Typography sx={{ color: '#aeb4b4', lineHeight: 1.6 }}>
                        {comment.comment}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* Footer */}
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ color: '#aeb4b4', mb: 1 }}>
                Thanks for reading! Share this article if you found it helpful.
              </Typography>
              <Link href="/blog">
                <Typography sx={{ color: '#00ACC1' }}>
                  ← Browse more articles
                </Typography>
              </Link>
            </Box>
              </motion.div>
            </Box>

            {/* Sidebar */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 300px' }, display: { xs: 'none', md: 'block' }, alignSelf: 'flex-start' }}>
              <Box sx={{ position: 'sticky', top: 80, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                {/* Recent Posts */}
                <Paper sx={{ bgcolor: '#13171a', borderRadius: '12px', p: 3, mb: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
                    Recent Posts
                  </Typography>
                  {recentPosts.length === 0 ? (
                    <Typography sx={{ color: '#666' }}>No other posts yet</Typography>
                  ) : (
                    recentPosts.map((recentPost) => (
                      <Link key={recentPost.slug} href={`/blog/${recentPost.slug}`}>
                        <Card sx={{ 
                          bgcolor: 'transparent', 
                          mb: 2, 
                          display: 'flex',
                          '&:hover': { bgcolor: 'rgba(0, 172, 193, 0.05)' },
                          transition: 'background-color 0.2s'
                        }}>
                          {recentPost.coverImage && (
                            <CardMedia
                              component="img"
                              sx={{ width: 80, height: 60, borderRadius: '8px' }}
                              image={recentPost.coverImage}
                              alt={recentPost.title}
                            />
                          )}
                          <CardContent sx={{ p: 1, pl: 2, '&:last-child': { pb: 1 } }}>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 500, lineHeight: 1.3 }}>
                              {recentPost.title.length > 50 ? recentPost.title.substring(0, 50) + '...' : recentPost.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              {new Date(recentPost.publishedAt || recentPost.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  )}
                </Paper>

                {/* Tags Cloud */}
                {post.tags && post.tags.length > 0 && (
                  <Paper sx={{ bgcolor: '#13171a', borderRadius: '12px', p: 3 }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {post.tags.map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(0, 172, 193, 0.15)',
                            color: '#00ACC1',
                            '&:hover': { bgcolor: 'rgba(0, 172, 193, 0.3)' }
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                )}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
  );
}
