'use client';
import React from 'react';
import { Box, Typography, Chip, Divider, Grid, Paper, LinearProgress } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import VerifiedIcon from '@mui/icons-material/Verified';
import BuildIcon from '@mui/icons-material/Build';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CountUp from '@/hooks/countUp';

export function SpecializationSection({ specialization }) {
  if (!specialization) return null;

  const { primarySkills = [], tools = [], specializations = [] } = specialization;

  if (primarySkills.length === 0 && tools.length === 0 && specializations.length === 0) {
    return null;
  }

  // Calculate max years for the "Years of Experience" highlight
  const maxYears = specializations.length > 0
    ? Math.max(...specializations.map(spec => spec.yearsOfExperience || 0))
    : 0;

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 10 },
        px: { xs: 2, sm: 4, md: 8, lg: 12 },
        backgroundColor: 'transparent', // Assuming parent has the dark bg
      }}
    >
      {/* Section Header */}
      <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
        <PsychologyIcon sx={{ fontSize: 40, color: '#00a1e0' }} />
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.2,
            }}
          >
            Specialization
          </Typography>
          <Divider sx={{ width: 60, height: 4, bgcolor: '#00a1e0', mt: 1, borderRadius: 2 }} />
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Experience & Specializations */}
        <Grid item xs={12} lg={7}>
          {/* Experience Highlight */}
          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: 24, md: 32 },
                fontWeight: 700,
                color: '#fff',
                mb: 1
              }}
            >
              <Box component="span" sx={{ color: '#00a1e0' }}>
                <CountUp from={0} to={maxYears} duration={2} />+ Years
              </Box>{' '}
              of Experience
            </Typography>
            <Typography variant="body1" sx={{ color: '#a0a0a0', fontSize: 16 }}>
              Delivering professional creative solutions with expertise and precision.
            </Typography>
          </Box>

          {/* Specialization Cards */}
          <Typography variant="h5" sx={{ color: '#fff', mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <WorkspacePremiumIcon sx={{ color: '#00a1e0' }} /> Core Competencies
          </Typography>
          
          <Grid container spacing={2}>
            {specializations.map((spec, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: '#00a1e0',
                      boxShadow: '0 4px 20px rgba(0, 161, 224, 0.15)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                      {spec.skill}
                    </Typography>
                    <Chip 
                      label={spec.level} 
                      size="small" 
                      sx={{ 
                        bgcolor: spec.level === 'Expert' ? 'rgba(0, 161, 224, 0.2)' : 'rgba(255, 255, 255, 0.1)', 
                        color: spec.level === 'Expert' ? '#00a1e0' : '#fff',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: spec.level === 'Expert' ? '#00a1e0' : 'transparent'
                      }} 
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#a0a0a0' }}>Experience:</Typography>
                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>{spec.yearsOfExperience} Years</Typography>
                  </Box>
                  
                  {/* Visual Progress Bar for Experience (assuming max 10 years for scale) */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((spec.yearsOfExperience / 10) * 100, 100)} 
                      sx={{ 
                        flexGrow: 1, 
                        height: 6, 
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#00a1e0',
                          borderRadius: 3,
                        }
                      }} 
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Right Column: Skills & Tools */}
        <Grid item xs={12} lg={5}>
          <Box sx={{ 
            bgcolor: 'rgba(11, 17, 19, 0.6)', 
            p: 4, 
            borderRadius: 4, 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            height: '100%'
          }}>
            {/* Primary Skills */}
            {primarySkills.length > 0 && (
              <Box sx={{ mb: 5 }}>
                <Typography variant="h5" sx={{ color: '#fff', mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VerifiedIcon sx={{ color: '#00a1e0' }} /> Primary Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {primarySkills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        color: '#e0e0e0',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: 14,
                        py: 0.5,
                        '&:hover': {
                          bgcolor: 'rgba(0, 161, 224, 0.1)',
                          borderColor: '#00a1e0',
                          color: '#fff'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Tools */}
            {tools.length > 0 && (
              <Box>
                <Typography variant="h5" sx={{ color: '#fff', mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BuildIcon sx={{ color: '#00a1e0' }} /> Tools & Software
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {tools.map((tool, index) => (
                    <Chip
                      key={index}
                      label={tool}
                      variant="outlined"
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: '#a0a0a0',
                        fontSize: 13,
                        '&:hover': {
                          borderColor: '#fff',
                          color: '#fff',
                          bgcolor: 'rgba(255,255,255,0.05)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
