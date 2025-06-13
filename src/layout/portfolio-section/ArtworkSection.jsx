'use client';
import React, { useState } from 'react';
import { Box, Typography, Card, CardMedia, CardContent, Chip, Pagination } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import moment from 'moment';

export function ArtworkSection({ artworks }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const itemsPerPage = 8; // 2 rows of 4 items each
  
  // Return null if artworks is null, undefined, not an array, or empty
  if (!artworks || !Array.isArray(artworks) || artworks.length === 0) {
    return null;
  }

  // Calculate pagination
  const totalPages = Math.ceil(artworks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArtworks = artworks.slice(startIndex, endIndex);  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const toggleDescription = (index) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const isDescriptionExpanded = (index) => {
    return expandedDescriptions[index] || false;
  };

  // Function to check if the media URL is a video
  const isVideoUrl = (url) => {
    if (!url) return false;
    // Check for common video file extensions
    const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.m4v'];
    const urlLower = url.toLowerCase();
    
    // Check file extensions
    const hasVideoExtension = videoExtensions.some(ext => urlLower.includes(ext));
    
    // Check for Cloudinary video URLs (contains 'video' in the URL)
    const isCloudinaryVideo = urlLower.includes('cloudinary') && urlLower.includes('video');
    
    return hasVideoExtension || isCloudinaryVideo;
  };
  return (
    <Box sx={{ py: 6, px: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', mb: 2 }}>
          Portfolio Gallery
        </Typography>
        <Typography variant="body1" sx={{ color: '#ccc' }}>
          Explore my creative works and artistic journey
        </Typography>
      </Box><Box 
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          justifyContent: currentArtworks.length <= 3 ? 'center' : 'flex-start'
        }}
      >
        {currentArtworks.map((artwork, index) => (
          <Box 
            key={index}
            sx={{
              flex: {
                xs: '1 1 100%',    // 1 per row on mobile
                sm: '1 1 calc(50% - 12px)',  // 2 per row on tablet
                md: '1 1 calc(25% - 18px)'   // 4 per row on desktop
              },
              maxWidth: {
                xs: '100%',
                sm: 'calc(50% - 12px)',
                md: 'calc(25% - 18px)'
              }
            }}
          >            <Card
              sx={{
                backgroundColor: '#1a1e23',
                border: '1px solid #333',
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                height: 'auto', // Fixed height for all cards
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0, 161, 224, 0.2)',
                  borderColor: '#00a1e0'
                }
              }}
            >{artwork.image && (
                <Box sx={{ position: 'relative', overflow: 'hidden', '&:hover .fullscreen-btn': { opacity: 1 } }}>                  {isVideoUrl(artwork.image) ? (
                    // Video display
                    <Box sx={{ position: 'relative', height: '200px' }}>                      <video
                        width="100%"
                        height="200"
                        style={{
                          objectFit: 'cover',
                          borderRadius: '0',
                          transition: 'transform 0.3s ease'
                        }}
                        preload="metadata"
                        poster={artwork.thumbnail || undefined}
                      >
                        <source src={artwork.image} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      
                      {/* Video Preview Play Button Overlay */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(0, 0, 0, 0.4)',
                          opacity: 1,
                          transition: 'opacity 0.3s ease',
                          cursor: 'pointer',
                          '&:hover': { 
                            opacity: 0.8,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)'
                          }
                        }}
                        onClick={(e) => {
                          e.currentTarget.style.display = 'none';
                          const video = e.currentTarget.previousElementSibling;
                          video.play();
                        }}
                      >
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0, 161, 224, 0.9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0, 161, 224, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              backgroundColor: '#00a1e0',
                              boxShadow: '0 6px 20px rgba(0, 161, 224, 0.5)'
                            }
                          }}
                        >
                          <PlayArrowIcon sx={{ color: '#fff', fontSize: 28, ml: 0.5 }} />
                        </Box>
                      </Box>
                        {/* Video type indicator */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          borderRadius: 1,
                          p: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <VideoLibraryIcon sx={{ color: '#00a1e0', fontSize: 16 }} />
                        <Typography variant="caption" sx={{ color: '#fff', fontSize: '0.7rem' }}>
                          VIDEO
                        </Typography>
                      </Box>

                      {/* Fullscreen button for video */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          borderRadius: 1,
                          p: 0.5,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 161, 224, 0.8)',
                            transform: 'scale(1.05)'
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const video = e.currentTarget.parentElement.querySelector('video');
                          if (video.requestFullscreen) {
                            video.requestFullscreen();
                          } else if (video.webkitRequestFullscreen) {
                            video.webkitRequestFullscreen();
                          } else if (video.msRequestFullscreen) {
                            video.msRequestFullscreen();
                          }
                        }}
                      >
                        <FullscreenIcon sx={{ color: '#fff', fontSize: 18 }} />
                      </Box>
                    </Box>
                  ) : (                    // Image display
                    <>
                      <CardMedia
                        component="img"
                        height="200"
                        image={artwork.image}
                        alt={artwork.title}
                        sx={{
                          transition: 'transform 0.3s ease',
                          '&:hover': { transform: 'scale(1.05)' }
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          '&:hover': { opacity: 1 }
                        }}
                      >
                        <VisibilityIcon sx={{ color: '#fff', fontSize: 32 }} />
                      </Box>                      {/* Fullscreen button for image */}
                      <Box
                        className="fullscreen-btn"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          borderRadius: 1,
                          p: 0.5,
                          cursor: 'pointer',
                          opacity: 0,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 161, 224, 0.8)',
                            transform: 'scale(1.05)'
                          }
                        }}                        onClick={(e) => {
                          e.stopPropagation();
                          // Create fullscreen image overlay
                          const overlay = document.createElement('div');
                          overlay.style.cssText = `
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100vw;
                            height: 100vh;
                            background: rgba(0, 0, 0, 0.95);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 9999;
                            cursor: pointer;
                          `;
                          
                          const img = document.createElement('img');
                          img.src = artwork.image;
                          img.alt = artwork.title;
                          img.style.cssText = `
                            max-width: 90vw;
                            max-height: 90vh;
                            object-fit: contain;
                            border-radius: 8px;
                          `;
                          
                          overlay.appendChild(img);
                          document.body.appendChild(overlay);
                          
                          // Close on click
                          overlay.addEventListener('click', () => {
                            document.body.removeChild(overlay);
                          });
                          
                          // Close on escape key
                          const handleEscape = (e) => {
                            if (e.key === 'Escape') {
                              document.body.removeChild(overlay);
                              document.removeEventListener('keydown', handleEscape);
                            }
                          };
                          document.addEventListener('keydown', handleEscape);
                        }}
                      >
                        <FullscreenIcon sx={{ color: '#fff', fontSize: 18 }} />
                      </Box>
                    </>
                  )}
                </Box>
              )}
                <CardContent sx={{ 
                p: 3, 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden'
              }}>
                {/* Top content - Title and Description */}
                <Box>
                  <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 'bold' }}>
                    {artwork.title}
                  </Typography>
                  {artwork.description && (
                    <Box sx={{ mb: 2 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#ccc', 
                          mb: 1, 
                          lineHeight: 1.5,
                          ...(isDescriptionExpanded(index) ? {} : {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          })
                        }}
                      >
                        {artwork.description}
                      </Typography>
                      {artwork.description.length > 100 && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#00a1e0',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                          onClick={() => toggleDescription(index)}
                        >
                          {isDescriptionExpanded(index) ? '...Show Less' : '...Read More'}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>                {/* Bottom content - Chips and Tools */}
                <Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {/* Media type indicator */}
                    {artwork.image && (
                      <Chip
                        label={isVideoUrl(artwork.image) ? 'Video' : 'Image'}
                        size="small"
                        icon={isVideoUrl(artwork.image) ? <VideoLibraryIcon /> : <ImageIcon />}
                        sx={{
                          backgroundColor: isVideoUrl(artwork.image) ? '#ff6b35' : '#4caf50',
                          color: '#fff',
                          fontSize: '0.75rem',
                          '& .MuiChip-icon': {
                            color: '#fff',
                            fontSize: '0.9rem'
                          }
                        }}
                      />
                    )}
                    
                    {artwork.category && (
                      <Chip
                        label={artwork.category}
                        size="small"
                        sx={{
                          backgroundColor: '#00a1e0',
                          color: '#fff',
                          fontSize: '0.75rem'
                        }}
                      />
                    )}
                    {artwork.date && (
                      <Chip
                        label={
                          moment().diff(moment(artwork.date), 'days') <= 30 
                            ? moment(artwork.date).fromNow()
                            : moment(artwork.date).format('MMM DD, YYYY')
                        }
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: '#00a1e0',
                          color: '#00a1e0',
                          fontSize: '0.75rem'
                        }}
                      />
                    )}
                  </Box>

                  {artwork.tools && artwork.tools.length > 0 && (
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 0.5,
                      maxHeight: '60px',
                      overflow: 'hidden'
                    }}>
                      {artwork.tools.slice(0, 4).map((tool, toolIndex) => (
                        <Chip
                          key={toolIndex}
                          label={tool}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: '#666',
                            color: '#ccc',
                            fontSize: '0.7rem'
                          }}
                        />
                      ))}
                      {artwork.tools.length > 4 && (
                        <Chip
                          label={`+${artwork.tools.length - 4} more`}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: '#00a1e0',
                            color: '#00a1e0',
                            fontSize: '0.7rem'
                          }}
                        />
                      )}
                    </Box>
                  )}
                </Box>
              </CardContent></Card>
          </Box>
        ))}
      </Box>
      
      {/* Message for few items */}
      {currentArtworks.length <= 3 && artworks.length <= 8 && (
        <Box sx={{ textAlign: 'center', mt: 4, p: 3 }}>
          <Typography variant="h6" sx={{ color: '#00a1e0', mb: 2 }}>
            {artworks.length === 1 ? '🎨 Featured Artwork' : 
             artworks.length === 2 ? '🎨 Selected Works' : 
             '🎨 Latest Creations'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#ccc', maxWidth: 600, mx: 'auto' }}>
            {artworks.length === 1 ? 
              'This masterpiece showcases the pinnacle of creative excellence and artistic vision.' :
              artworks.length === 2 ?
              'These carefully selected pieces represent the essence of artistic creativity and skill.' :
              'Discover these exceptional works that demonstrate remarkable talent and innovation.'}
          </Typography>
        </Box>
      )}
      
      {/* Empty space filler for partial pages */}
      {currentArtworks.length < 8 && currentArtworks.length > 3 && (
        <Box sx={{ textAlign: 'center', mt: 4, p: 3 }}>
          <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
            More amazing artworks coming soon...
          </Typography>
        </Box>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                backgroundColor: '#1a1e23',
                border: '1px solid #333',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#00a1e0',
                  borderColor: '#00a1e0'
                },
                '&.Mui-selected': {
                  backgroundColor: '#00a1e0',
                  borderColor: '#00a1e0',
                  color: '#fff'
                }
              }
            }}
          />        </Box>
      )}
    </Box>
  );
}
