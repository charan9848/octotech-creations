'use client';
import React from 'react';
import { Box, Typography, Card, CardContent, useTheme, useMediaQuery } from '@mui/material';
import { 
  Timeline, 
  TimelineItem, 
  TimelineSeparator, 
  TimelineConnector, 
  TimelineContent, 
  TimelineDot,
  TimelineOppositeContent,
  timelineOppositeContentClasses
} from '@mui/lab';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work';
import { motion } from 'framer-motion';

export function ExperienceSection({ experience }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!experience || !Array.isArray(experience) || experience.length === 0) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        pt: { xs: 8, md: 12 },
        pb: { xs: 6, md: 10 },
        px: { xs: 2, sm: 4, md: 8 },
        background: 'linear-gradient(180deg, #000000 0%, #0a1929 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
       {/* Background Elements */}
       <Box sx={{
        position: 'absolute',
        top: '10%',
        left: '-5%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 161, 224, 0.15) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(40px)',
        zIndex: 0
      }} />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              background: 'linear-gradient(45deg, #fff 30%, #00a1e0 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Professional Journey
          </Typography>
          <Box sx={{ 
            width: '60px', 
            height: '4px', 
            bgcolor: '#00a1e0', 
            mx: 'auto', 
            borderRadius: '2px' 
          }} />
        </Box>

        <Timeline 
          position={isMobile ? "right" : "alternate"}
          sx={{
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.2,
            },
            p: 0
          }}
        >
          {experience.map((exp, index) => (
            <TimelineItem key={index}>
              {!isMobile && (
                <TimelineOppositeContent sx={{ m: 'auto 0' }}>
                  <Typography variant="h6" component="span" sx={{ color: '#00a1e0', fontWeight: 'bold', display: 'block' }}>
                    {exp.duration}
                  </Typography>
                </TimelineOppositeContent>
              )}
              
              <TimelineSeparator>
                <TimelineConnector sx={{ bgcolor: 'rgba(0, 161, 224, 0.3)' }} />
                <TimelineDot sx={{ bgcolor: '#00a1e0', boxShadow: '0 0 10px #00a1e0' }}>
                  <WorkIcon sx={{ fontSize: '1.2rem' }} />
                </TimelineDot>
                <TimelineConnector sx={{ bgcolor: 'rgba(0, 161, 224, 0.3)' }} />
              </TimelineSeparator>
              
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      border: '1px solid rgba(0, 161, 224, 0.5)',
                      boxShadow: '0 10px 40px rgba(0, 161, 224, 0.1)'
                    }
                  }}>
                    <CardContent>
                      {isMobile && (
                        <Typography variant="subtitle2" sx={{ color: '#00a1e0', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarTodayIcon fontSize="small" />
                          {exp.duration}
                        </Typography>
                      )}
                      
                      <Typography variant="h5" component="div" sx={{ color: '#fff', fontWeight: 'bold', mb: 1 }}>
                        {exp.role}
                      </Typography>
                      
                      <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon fontSize="small" />
                        {exp.company}
                      </Typography>

                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2, lineHeight: 1.6 }}>
                        {exp.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>
    </Box>
  );
}
