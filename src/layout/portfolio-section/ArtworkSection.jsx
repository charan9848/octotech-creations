'use client';
import React from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Chip } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import VisibilityIcon from '@mui/icons-material/Visibility';

export function ArtworkSection({ artworks }) {
  // Return null if artworks is null, undefined, not an array, or empty
  if (!artworks || !Array.isArray(artworks) || artworks.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: 6, px: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', mb: 2 }}>
          Portfolio Gallery
        </Typography>
        <Typography variant="body1" sx={{ color: '#ccc' }}>
          Explore my creative works and artistic journey
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {artworks.map((artwork, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                backgroundColor: '#1a1e23',
                border: '1px solid #333',
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0, 161, 224, 0.2)',
                  borderColor: '#00a1e0'
                }
              }}
            >
              {artwork.imageUrl && (
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={artwork.imageUrl}
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
                  </Box>
                </Box>
              )}
              
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 'bold' }}>
                  {artwork.title}
                </Typography>
                
                {artwork.description && (
                  <Typography variant="body2" sx={{ color: '#ccc', mb: 2, lineHeight: 1.5 }}>
                    {artwork.description}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
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
                  
                  {artwork.year && (
                    <Chip
                      label={artwork.year}
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
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {artwork.tools.map((tool, toolIndex) => (
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
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
