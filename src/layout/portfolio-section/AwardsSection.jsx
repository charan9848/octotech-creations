'use client';
import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Pagination } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';
import { motion } from 'framer-motion';

export function AwardsSection({ awards }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 
  
  if (!awards || !Array.isArray(awards) || awards.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(awards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAwards = awards.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Box 
      sx={{ 
        pt: { xs: 6, md: 10 },
        pb: { xs: 6, md: 10 },
        px: { xs: 2, sm: 4, md: 8 },
        background: 'linear-gradient(180deg, #0a1929 0%, #000000 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Elements */}
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        right: '-5%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(60px)',
        zIndex: 0
      }} />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              background: 'linear-gradient(45deg, #fff 30%, #FFD700 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Honors & Awards
          </Typography>
          <Box sx={{ 
            width: '60px', 
            height: '4px', 
            bgcolor: '#FFD700', 
            mx: 'auto', 
            borderRadius: '2px' 
          }} />
        </Box>

        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)'
            },
            gap: 4
          }}
        >
          {currentAwards.map((award, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                sx={{
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 215, 0, 0.1)',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(255, 215, 0, 0.15)',
                    border: '1px solid rgba(255, 215, 0, 0.4)',
                    '& .award-icon': {
                      transform: 'scale(1.1) rotate(10deg)',
                      color: '#FFD700'
                    }
                  }
                }}
              >
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100px',
                    height: '100px',
                    background: 'linear-gradient(135deg, transparent 50%, rgba(255, 215, 0, 0.1) 50%)',
                    borderBottomLeftRadius: '100px'
                  }}
                />

                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                    <Box 
                      className="award-icon"
                      sx={{ 
                        p: 1.5, 
                        borderRadius: '12px', 
                        bgcolor: 'rgba(255, 215, 0, 0.1)',
                        color: 'rgba(255, 215, 0, 0.8)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <EmojiEventsIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold', mb: 1, lineHeight: 1.3 }}>
                        {award.title}
                      </Typography>
                      {award.organization && (
                        <Typography variant="subtitle2" sx={{ color: '#FFD700', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BusinessIcon sx={{ fontSize: 16 }} />
                          {award.organization}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, lineHeight: 1.6 }}>
                    {award.description}
                  </Typography>

                  {award.year && (
                    <Box sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      px: 2, 
                      py: 0.5, 
                      borderRadius: '20px', 
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <CalendarTodayIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }} />
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                        {award.year}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
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
                    backgroundColor: '#FFD700',
                    color: '#000',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#E6C200'
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    color: '#FFD700'
                  }
                }
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
