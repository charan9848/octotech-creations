'use client';
import React, { useState } from 'react';
import { Box, Typography, Chip, Divider, Card, CardContent, Pagination } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import StarIcon from '@mui/icons-material/Star';
import BuildIcon from '@mui/icons-material/Build';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CountUp from '@/hooks/countUp';

export function SpecializationSection({ specialization }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1; // Show one specialization per page

  if (!specialization) return null;

  const { primarySkills = [], tools = [], specializations = [] } = specialization;

  // Return null if all arrays are empty
  if (primarySkills.length === 0 && tools.length === 0 && specializations.length === 0) {
    return null;
  }

  // Calculate the maximum years of experience from specializations
  const yearsOfExperience = specializations.length > 0
    ? Math.max(...specializations.map(spec => spec.yearsOfExperience || 0))
    : 0;

  // Pagination for specializations
  const totalPages = Math.ceil(specializations.length / itemsPerPage);
  const currentIndex = (currentPage - 1) * itemsPerPage;
  const currentSpecialization = specializations[currentIndex];

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Box
      p={{ xs: 2, sm: 3, md: 5 }}
      sx={{
        px: { xs: "20px", sm: "40px", md: "60px", lg: "90px" },
      }}
    >
      <Box sx={{ display: 'flex' }}>
        <PsychologyIcon sx={{ fontSize: { xs: '24px', sm: '28px', md: '32px' }, color: 'white' }} />
        <Typography
          variant="h1"
          color='white'
          mx={2}
          sx={{
            fontSize: { xs: "20px", sm: "24px", md: "30px", lg: "36px", xl: "40px" },
            fontWeight: 'bold'
          }}
        >
          Specialization
        </Typography>
      </Box>
      <Divider sx={{
        backgroundColor: '#2196f3',
        height: '2px',
        width: { xs: '60px', sm: '80px', md: '100px' },
        marginTop: '10px',
        marginBottom: { xs: 2, sm: 3, md: 4 }
      }} />      <Box>
        {/* Years of Experience */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: "space-between" }}>
          <Box>
            <Typography
              variant='h3'
              color='white'
              sx={{
                fontSize: { xs: "24px", sm: "28px", md: "32px" },
                fontWeight: 'bold',
                mb: 1
              }}
            >
              Around <CountUp
                from={0}
                to={yearsOfExperience}
                separator=","
                direction="up"
                duration={1}
                className="count-up-text"
              />+ Years of Experience
            </Typography>
            <Typography
              variant='body1'
              color='#8d8d8f'
              sx={{ fontSize: { xs: "14px", sm: "16px" } }}
            >
              Professional creative expertise
            </Typography>
            
            <Box m={3}>
              <img src="https://res.cloudinary.com/djbilxr7i/image/upload/v1749488147/Untitled_design_1_gday0k.png" height="auto" width="500px" />
            </Box>
          </Box>
          <Box sx={{
            border: '1px solid #333',
            width: { xs: '100%', sm: '60%', md: '50%' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: '#0B1113',
            borderRadius: '10px',
            p: 2
          }}>
            {/* Current Specialization */}
            {specializations.length > 0 && currentSpecialization && (
              <Box sx={{
                border: "1px solid #333",
                borderRadius: '10px',
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                mb: 2
              }}>
                <Box>
                  <Typography variant='h1' color='white'>{currentSpecialization.skill}</Typography>
                  <Typography variant='body1' color='#8d8d8f' sx={{ fontSize: { xs: "14px", sm: "16px" } }}>
                    Exp: {currentSpecialization.yearsOfExperience} Years
                  </Typography>
                  <Chip
                    label={currentSpecialization.level}
                    sx={{
                      backgroundColor: 'yellow',
                      color: 'black',
                      margin: '4px'
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Pagination - Only show if more than 1 specialization */}
            {specializations.length > 1 && (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
                mb: 2
              }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  size="medium"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#8d8d8f',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      minWidth: { xs: '28px', sm: '32px' },
                      height: { xs: '28px', sm: '32px' },
                      '&:hover': {
                        backgroundColor: '#2196f3',
                        color: 'white',
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#2196f3',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#1976d2',
                        }
                      }
                    }
                  }}
                />

                {/* Specialization Counter */}
                <Typography
                  variant="body2"
                  color="#8d8d8f"
                  sx={{
                    fontSize: { xs: "12px", sm: "14px" },
                    textAlign: 'center'
                  }}
                >
                  Specialization {currentPage} of {totalPages}
                </Typography>
              </Box>
            )}            {/* Primary Skills and Tools */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              {primarySkills.length > 0 && (
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <Typography variant='h2' color='white' sx={{ mb: 2 }}>Primary Skills</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                    {primarySkills.map(skill => (
                      <Chip
                        key={skill}
                        label={skill}
                        sx={{
                          backgroundColor: '#2196f3',
                          color: 'white',
                          margin: '2px'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {tools.length > 0 && (
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <Typography variant='h2' color='white' sx={{ mb: 2 }}>Tools</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                    {tools.map(tool => (
                      <Chip
                        key={tool}
                        label={tool}
                        sx={{
                          backgroundColor: '#2196f3',
                          color: 'white',
                          margin: '2px'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>


      </Box>

    </Box>
  );
}
