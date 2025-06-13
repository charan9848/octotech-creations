'use client';
import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Pagination } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';

export function AwardsSection({ awards }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 2 rows of 4 items each
  
  // Return null if awards is null, undefined, not an array, or empty
  if (!awards || !Array.isArray(awards) || awards.length === 0) {
    return null;
  }

  // Calculate pagination
  const totalPages = Math.ceil(awards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAwards = awards.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  return (
    <Box sx={{ py: 6, px: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', mb: 2 }}>
          Awards & Recognition
        </Typography>
        <Typography variant="body1" sx={{ color: '#ccc' }}>
          Achievements and honors received throughout my career
        </Typography>
      </Box><Box 
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          justifyContent: currentAwards.length <= 3 ? 'center' : 'flex-start'
        }}
      >
        {currentAwards.map((award, index) => (
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
          >
            <Card
              sx={{
                backgroundColor: '#1a1e23',
                border: '1px solid #333',
                borderRadius: 2,
                height: '100%',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(255, 215, 0, 0.2)',
                  borderColor: '#FFD700'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                }
              }}
            >
              <CardContent sx={{ p: 3, pt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 32 }} />
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    {award.title}
                  </Typography>
                </Box>

                {award.organization && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BusinessIcon sx={{ color: '#00a1e0', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: '#00a1e0' }}>
                      {award.organization}
                    </Typography>
                  </Box>
                )}

                {award.year && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarTodayIcon sx={{ color: '#ccc', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: '#ccc' }}>
                      {award.year}
                    </Typography>
                  </Box>
                )}

                {award.description && (
                  <Typography variant="body2" sx={{ color: '#ccc', lineHeight: 1.6, mt: 2 }}>
                    {award.description}
                  </Typography>
                )}              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
      
      {/* Message for few items */}
      {currentAwards.length <= 3 && awards.length <= 8 && (
        <Box sx={{ textAlign: 'center', mt: 4, p: 3 }}>
          <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
            {awards.length === 1 ? '🏆 Outstanding Achievement' : 
             awards.length === 2 ? '🏆 Distinguished Honors' : 
             '🏆 Excellence Recognition'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#ccc', maxWidth: 600, mx: 'auto' }}>
            {awards.length === 1 ? 
              'This prestigious award represents the highest level of achievement and recognition in the field.' :
              awards.length === 2 ?
              'These distinguished honors reflect exceptional dedication and outstanding contributions to the craft.' :
              'These awards celebrate remarkable achievements and the pursuit of excellence in creative endeavors.'}
          </Typography>
        </Box>
      )}
      
      {/* Empty space filler for partial pages */}
      {currentAwards.length < 8 && currentAwards.length > 3 && (
        <Box sx={{ textAlign: 'center', mt: 4, p: 3 }}>
          <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
            More achievements and recognition to come...
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
                  backgroundColor: '#FFD700',
                  borderColor: '#FFD700',
                  color: '#000'
                },
                '&.Mui-selected': {
                  backgroundColor: '#FFD700',
                  borderColor: '#FFD700',
                  color: '#000'
                }
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
}
