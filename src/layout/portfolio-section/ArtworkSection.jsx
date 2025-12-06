'use client';
import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Pagination, Modal, IconButton, Backdrop, Fade, Chip } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

export function ArtworkSection({ artworks }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const itemsPerPage = 8; 
  
  if (!artworks || !Array.isArray(artworks) || artworks.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(artworks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArtworks = artworks.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    const element = document.getElementById('artwork-section');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const isVideoUrl = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.m4v'];
    const urlLower = url.toLowerCase();
    return videoExtensions.some(ext => urlLower.includes(ext)) || (urlLower.includes('cloudinary') && urlLower.includes('video'));
  };

  return (
    <Box 
      id="artwork-section"
      sx={{ 
        py: { xs: 6, md: 10 },
        px: { xs: 2, sm: 4, md: 8 },
        background: '#050505',
        position: 'relative'
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography 
          variant="h2" 
          sx={{ 
            fontSize: { xs: '2rem', md: '3rem' },
            fontWeight: 700,
            color: '#fff',
            mb: 2
          }}
        >
          Creative <span style={{ color: '#00a1e0' }}>Gallery</span>
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px', mx: 'auto' }}>
          A collection of my best works, ranging from digital art to multimedia projects.
        </Typography>
      </Box>

      <Box 
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: 3
        }}
      >
        <AnimatePresence mode='wait'>
          {currentArtworks.map((artwork, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              layout
            >
              <Card
                onClick={() => setSelectedArtwork(artwork)}
                sx={{
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0, 161, 224, 0.2)',
                    border: '1px solid rgba(0, 161, 224, 0.5)',
                    '& .artwork-overlay': {
                      opacity: 1
                    }
                  }
                }}
              >
                <Box sx={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
                  {isVideoUrl(artwork.image) ? (
                    <Box 
                      component="video"
                      src={artwork.image}
                      poster={artwork.thumbnail}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Box 
                      component="img"
                      src={artwork.image}
                      alt={artwork.title}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    />
                  )}
                  
                  {/* Overlay */}
                  <Box 
                    className="artwork-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'rgba(0,0,0,0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    }}
                  >
                    {isVideoUrl(artwork.image) ? (
                      <PlayArrowIcon sx={{ color: '#fff', fontSize: '3rem' }} />
                    ) : (
                      <ImageIcon sx={{ color: '#fff', fontSize: '3rem' }} />
                    )}
                  </Box>

                  {/* Type Badge */}
                  <Chip
                    icon={isVideoUrl(artwork.image) ? <VideoLibraryIcon sx={{ fontSize: 16 }} /> : <ImageIcon sx={{ fontSize: 16 }} />}
                    label={isVideoUrl(artwork.image) ? "Video" : "Image"}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: '#fff',
                      backdropFilter: 'blur(4px)',
                      zIndex: 2,
                      '& .MuiChip-icon': { color: '#fff' }
                    }}
                  />
                </Box>

                <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {artwork.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {artwork.description}
                  </Typography>

                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {artwork.category && (
                        <Chip label={artwork.category} size="small" sx={{ bgcolor: 'rgba(0, 161, 224, 0.2)', color: '#00a1e0', fontSize: '0.7rem' }} />
                      )}
                      {artwork.tools && artwork.tools.slice(0, 2).map((tool, i) => (
                        <Chip key={i} label={tool} size="small" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }} />
                      ))}
                    </Box>
                    
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: 12 }} />
                      {moment(artwork.date).format('MMM D, YYYY')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Pagination 
            count={totalPages} 
            page={currentPage} 
            onChange={handlePageChange}
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'rgba(255,255,255,0.6)',
                '&.Mui-selected': {
                  backgroundColor: '#00a1e0',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#008dc2'
                  }
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }
            }}
          />
        </Box>
      )}

      {/* Modal for viewing artwork */}
      <Modal
        open={!!selectedArtwork}
        onClose={() => setSelectedArtwork(null)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: { background: 'rgba(0,0,0,0.9)' }
          },
        }}
      >
        <Fade in={!!selectedArtwork}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', md: '85%', lg: '75%' },
            maxHeight: '90vh',
            bgcolor: '#1a1e23',
            border: '1px solid #333',
            borderRadius: '16px',
            boxShadow: 24,
            p: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' }
          }}>
            <IconButton 
              onClick={() => setSelectedArtwork(null)}
              sx={{ position: 'absolute', top: 10, right: 10, color: '#fff', zIndex: 10, bgcolor: 'rgba(0,0,0,0.5)' }}
            >
              <CloseIcon />
            </IconButton>

            {selectedArtwork && (
              <>
                <Box sx={{ flex: 2, bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: { xs: '40vh', md: '90vh' }, position: 'relative' }}>
                  {isVideoUrl(selectedArtwork.image) ? (
                    <Box 
                      component="video"
                      src={selectedArtwork.image}
                      controls
                      autoPlay
                      sx={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                  ) : (
                    <Box 
                      component="img"
                      src={selectedArtwork.image}
                      alt={selectedArtwork.title}
                      sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  )}
                </Box>
                <Box sx={{ flex: 1, p: 4, overflowY: 'auto', maxHeight: { xs: '50vh', md: '90vh' }, bgcolor: '#1a1e23' }}>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', mb: 2 }}>
                    {selectedArtwork.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {selectedArtwork.category && (
                      <Chip label={selectedArtwork.category} sx={{ bgcolor: '#00a1e0', color: '#fff' }} />
                    )}
                    {selectedArtwork.date && (
                      <Chip label={moment(selectedArtwork.date).format('MMM D, YYYY')} variant="outlined" sx={{ borderColor: '#666', color: '#ccc' }} />
                    )}
                  </Box>

                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, mb: 4 }}>
                    {selectedArtwork.description}
                  </Typography>

                  {selectedArtwork.tools && selectedArtwork.tools.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#00a1e0', mb: 1 }}>Tools Used</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedArtwork.tools.map((tool, i) => (
                          <Chip key={i} label={tool} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
