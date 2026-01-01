'use client';
import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, useTheme, useMediaQuery, Button, Collapse } from '@mui/material';
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { motion } from 'framer-motion';

// Experience Card Component with Read More functionality
function ExperienceCard({ exp, isMobile }) {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 80; // Characters to show before truncating
  
  const shouldTruncate = isMobile && exp.description && exp.description.length > maxLength;
  const displayText = shouldTruncate && !expanded 
    ? exp.description.substring(0, maxLength) + '...'
    : exp.description;

  return (
    <Card sx={{ 
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease',
      overflow: 'hidden',
      '&:hover': {
        transform: isMobile ? 'none' : 'translateY(-5px)',
        border: '1px solid rgba(0, 161, 224, 0.5)',
        boxShadow: '0 10px 40px rgba(0, 161, 224, 0.1)'
      }
    }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', p: { xs: 2, md: 3 } }}>
        {isMobile && (
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: '#00a1e0', 
              mb: 1, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              fontSize: '0.75rem'
            }}
          >
            <CalendarTodayIcon sx={{ fontSize: '0.875rem' }} />
            {exp.duration}
          </Typography>
        )}
        
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            color: '#fff', 
            fontWeight: 'bold', 
            mb: 0.5,
            fontSize: { xs: '1rem', md: '1.25rem' }
          }}
        >
          {exp.role}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <BusinessIcon sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, color: 'rgba(255,255,255,0.7)' }} />
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              fontSize: { xs: '0.875rem', md: '1rem' }
            }}
          >
            {exp.company}
          </Typography>
        </Box>

        {/* Description with Read More */}
        <Collapse in={!shouldTruncate || expanded} collapsedSize={isMobile ? 40 : 'auto'}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.6)', 
              lineHeight: 1.6,
              fontSize: { xs: '0.75rem', md: '0.875rem' }
            }}
          >
            {exp.description}
          </Typography>
        </Collapse>

        {/* Show truncated text when collapsed on mobile */}
        {shouldTruncate && !expanded && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.6)', 
              lineHeight: 1.6,
              fontSize: { xs: '0.75rem', md: '0.875rem' },
              display: { xs: 'block', md: 'none' }
            }}
          >
            {displayText}
          </Typography>
        )}

        {/* Read More Button - only on mobile when text is long */}
        {shouldTruncate && (
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ 
              color: '#00a1e0', 
              mt: 1, 
              p: 0,
              minWidth: 'auto',
              alignSelf: 'flex-start',
              fontSize: '0.75rem',
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'transparent',
                textDecoration: 'underline'
              }
            }}
          >
            {expanded ? 'Show Less' : 'Read More'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function ExperienceSection({ experience }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!experience || !Array.isArray(experience) || experience.length === 0) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        pt: { xs: 6, md: 12 },
        pb: { xs: 4, md: 10 },
        px: { xs: 1, sm: 2, md: 8 },
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
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 8 } }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontSize: { xs: '1.5rem', md: '3rem' },
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
          position="right"
          sx={{
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: isMobile ? 0 : 0.2,
              display: isMobile ? 'none' : 'block',
            },
            p: 0,
            m: 0
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
                <TimelineDot sx={{ bgcolor: '#00a1e0', boxShadow: '0 0 10px #00a1e0', p: { xs: 0.5, md: 1 } }}>
                  <WorkIcon sx={{ fontSize: { xs: '0.875rem', md: '1.2rem' } }} />
                </TimelineDot>
                <TimelineConnector sx={{ bgcolor: 'rgba(0, 161, 224, 0.3)' }} />
              </TimelineSeparator>
              
              <TimelineContent sx={{ py: { xs: 1, md: '12px' }, px: { xs: 1, md: 2 } }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ExperienceCard exp={exp} isMobile={isMobile} />
                </motion.div>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>
    </Box>
  );
}
