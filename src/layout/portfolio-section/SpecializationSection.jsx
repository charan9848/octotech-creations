'use client';
import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import VerifiedIcon from '@mui/icons-material/Verified';
import BuildIcon from '@mui/icons-material/Build';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import StarIcon from '@mui/icons-material/Star';
import CountUp from '@/hooks/countUp';

export function SpecializationSection({ specialization }) {
  if (!specialization) return null;

  const { primarySkills = [], tools = [], specializations = [] } = specialization;

  if (primarySkills.length === 0 && tools.length === 0 && specializations.length === 0) {
    return null;
  }

  const maxYears = specializations.length > 0
    ? Math.max(...specializations.map(spec => spec.yearsOfExperience || 0))
    : 0;

  // Get chip color based on level
  const getLevelColor = (level) => {
    if (level === 'Master') return 'warning';
    if (level === 'Expert') return 'info';
    return 'default';
  };

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 10 },
        px: { xs: 2, sm: 4, md: 8, lg: 12 },
        backgroundColor: 'transparent',
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
        {/* Left Column */}
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

          {/* Core Competencies - List Style */}
          <Typography variant="h5" sx={{ color: '#fff', mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <WorkspacePremiumIcon sx={{ color: '#00a1e0' }} /> Core Competencies
          </Typography>

          <List sx={{ bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
            {specializations.map((spec, index) => (
              <React.Fragment key={index}>
                <ListItem
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    py: 2,
                    px: 3,
                  }}
                >
                  {/* Skill Name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, width: '100%' }}>
                    <ListItemIcon sx={{ minWidth: 'auto' }}>
                      <StarIcon sx={{ color: '#00a1e0', fontSize: 20 }} />
                    </ListItemIcon>
                    <Typography
                      sx={{
                        color: '#ffffff !important',
                        fontWeight: 600,
                        fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                      }}
                    >
                      {spec.skill}
                    </Typography>
                  </Box>

                  {/* Level & Experience Row */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 4, width: 'calc(100% - 32px)' }}>
                    <Chip
                      label={spec.level}
                      size="small"
                      color={getLevelColor(spec.level)}
                      variant="outlined"
                    />
                    <Typography variant="body2" sx={{ color: '#a0a0a0' }}>
                      {spec.yearsOfExperience} Years Experience
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((spec.yearsOfExperience / 10) * 100, 100)}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#00a1e0',
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </ListItem>
                {index < specializations.length - 1 && (
                  <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                )}
              </React.Fragment>
            ))}
          </List>
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
