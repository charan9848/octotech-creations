'use client';
import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';

export function AwardsSection({ awards }) {
  // Return null if awards is null, undefined, not an array, or empty
  if (!awards || !Array.isArray(awards) || awards.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: 6, px: 4, backgroundColor: '#0B1113' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', mb: 2 }}>
          Awards & Recognition
        </Typography>
        <Typography variant="body1" sx={{ color: '#ccc' }}>
          Achievements and honors received throughout my career
        </Typography>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        {awards.map((award, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
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
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
