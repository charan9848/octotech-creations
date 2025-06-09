'use client';
import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Divider, CardHeader, Avatar, Tooltip, Pagination } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { FaBriefcase } from 'react-icons/fa';

export function ExperienceSection({ experience }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1; // Show one experience per page
  
  // Return null if experience is null, undefined, not an array, or empty
  if (!experience || !Array.isArray(experience) || experience.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(experience.length / itemsPerPage);
  const currentIndex = (currentPage - 1) * itemsPerPage;
  const currentExperience = experience[currentIndex];

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  return (
    <Box 
      p={{ xs: 2, sm: 3, md: 5 }} 
      sx={{ 
        px: { xs: "20px", sm: "40px", md: "60px", lg: "90px" }, 
        backgroundColor: '#0B1113' 
      }}
    >
      <Box sx={{ display: 'flex' }}>
        <BusinessIcon sx={{ fontSize: { xs: '24px', sm: '28px', md: '32px' }, color: 'white' }} />
        <Typography 
          variant="h1" 
          color='white' 
          mx={2} 
          sx={{ 
            fontSize: { xs: "20px", sm: "24px", md: "30px", lg: "36px", xl: "40px" },
            fontWeight: 'bold'
          }}
        >
          Experience
        </Typography>
      </Box>
      <Divider sx={{ 
        backgroundColor: '#2196f3', 
        height: '2px', 
        width: { xs: '60px', sm: '80px', md: '100px' }, 
        marginTop: '10px',
        marginBottom: { xs: 2, sm: 3, md: 4 }
      }} />

      <Box sx={{
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: { xs: 'center', md: 'space-between' }, 
        alignItems: { xs: 'center', md: 'flex-start' },
        gap: { xs: 3, md: 4 }
      }}>
        {/* Experience Section */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          width: { xs: '100%', md: '50%' },
          maxWidth: { xs: '100%', sm: '600px', md: 'none' },
          position: 'relative'
        }}>
          {/* Experience Card */}
          <Box sx={{ 
            width: '100%', 
            maxWidth: { xs: '100%', sm: '500px', md: '450px', lg: '500px' },
            mb: { xs: 2, md: 3 }
          }}>
            <Card sx={{
              backgroundColor: '#1a1e23', 
              height: { xs: "auto", sm: "320px", md: "300px" }, 
              width: "100%", 
              border: '1px solid #333',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
              <CardHeader
                avatar={
                  <Tooltip title={currentExperience.company}>                
                      <Avatar sx={{
                      width: { xs: 50, sm: 60 },
                      height: { xs: 50, sm: 60 },
                      backgroundColor: '#2196f3',
                      fontSize: { xs: '20px', sm: '24px' },
                      marginLeft: { xs: '5px', sm: '10px' },
                    }}>
                      <FaBriefcase />
                    </Avatar>
                  </Tooltip>
                } 
                title={
                  <Typography 
                    variant="h1" 
                    fontSize={{ xs: "18px", sm: "22px", md: "25px" }} 
                    color='white' 
                    mx={1} 
                    component="h3"
                    sx={{ 
                      fontWeight: 'bold',
                      lineHeight: 1.2
                    }}
                  >
                    {currentExperience.role}
                  </Typography>
                }
                subheader={
                  <Typography 
                    variant="h2" 
                    mx={1} 
                    color="#8d8d8f"
                    sx={{
                      fontSize: { xs: "14px", sm: "16px" },
                      fontWeight: 500
                    }}
                  >
                    {currentExperience.company}
                  </Typography>
                }
                sx={{
                  pb: { xs: 1, sm: 2 }
                }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Typography 
                  variant="body1" 
                  color="#707173" 
                  mx={2} 
                  gutterBottom
                  sx={{
                    fontSize: { xs: "13px", sm: "14px" },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: { xs: 1, sm: 2 }
                  }}
                >
                  {currentExperience.duration} 
                  <CalendarTodayIcon sx={{ fontSize: { xs: '14px', sm: '16px' } }} />
                </Typography>

                <Box sx={{
                  maxHeight: { xs: 'auto', sm: '120px' },
                  overflowY: { xs: 'visible', sm: 'auto' },
                  pr: { xs: 0, sm: 1 },
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#1a1e23',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#2196f3',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: '#1976d2',
                  },
                }}>
                  <Typography 
                    variant="body1" 
                    color="#8d8d8f" 
                    mx={2} 
                    sx={{ 
                      textAlign: 'justify',
                      fontSize: { xs: "13px", sm: "14px" },
                      lineHeight: { xs: 1.4, sm: 1.5 }
                    }}
                  >
                    {currentExperience.description}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Pagination - Only show if more than 1 experience */}
          {experience.length > 1 && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: { xs: 1, sm: 1.5 },
              width: '100%'
            }}>              <Pagination
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
              
              {/* Experience Counter */}
              <Typography 
                variant="body2" 
                color="#8d8d8f" 
                sx={{ 
                  mt: { xs: 0.5, sm: 1 },
                  fontSize: { xs: "12px", sm: "14px" },
                  textAlign: 'center'
                }}
              >
                Experience {currentPage} of {totalPages}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Image Section */}
        <Box sx={{ 
          width: { xs: "100%", md: "50%" },
          display: { xs: "flex", md: 'flex' },
          justifyContent: 'center',
          alignItems: { xs: 'center', md: 'flex-start' },
          mt: { xs: 2, md: 0 }
        }}>
          <Box
            component="img"
            src="https://res.cloudinary.com/djbilxr7i/image/upload/v1749118594/Untitled_design_h9bcbi.png"
            alt="Artist Experience"
            sx={{
              width: { xs: "90%", sm: "80%", md: "100%" },
              maxWidth: { xs: "400px", sm: "500px", md: "none" },
              height: "auto",
              borderRadius: "12px",
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              objectFit: 'cover'
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
