'use client';
import React from 'react';
import { Box, Typography, Card, CardContent, Divider } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export function ExperienceSection({ experience }) {
  // Return null if experience is null, undefined, not an array, or empty
  if (!experience || !Array.isArray(experience) || experience.length === 0) {
    return null;
  }

  return (
    <Box>
    <Box sx={{ width: '55%', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto', backgroundColor: '#15191c', borderRadius: 2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>    
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <BusinessIcon sx={{ color: '#00a1e0', fontSize: 28 }} />
        <Typography variant="h4" mx={2} sx={{ color: '#fff', fontWeight: 'bold' }}>
          Experience
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center'}}> 
        {experience.map((exp, index) => (
          <Card 
            key={index}
            sx={{
              backgroundColor: '#1a1e23',
              border: '1px solid #333',
              borderRadius: 2,
              borderLeft: '4px solid #00a1e0',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateX(4px)',
                boxShadow: '0 4px 12px rgba(0, 161, 224, 0.15)',
                borderLeftColor: '#FFD700'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <WorkIcon sx={{ color: '#00a1e0', fontSize: 20 }} />
                <Typography variant="h6" sx={{ color: '#00a1e0', fontWeight: 'bold' }}>
                  {exp.role}
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ color: '#fff', mb: 1, fontWeight: 500 }}>
                {exp.company}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CalendarTodayIcon sx={{ color: '#ccc', fontSize: 16 }} />
                <Typography variant="body2" sx={{ color: '#ccc', fontStyle: 'italic' }}>
                  {exp.duration}
                </Typography>
              </Box>
              
              {exp.description && (
                <>
                  <Divider sx={{ backgroundColor: '#333', my: 2 }} />
                  <Typography variant="body2" sx={{ color: '#ccc', lineHeight: 1.6 }}>
                    {exp.description}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
    </Box>
  );
}
