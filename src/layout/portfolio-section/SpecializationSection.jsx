'use client';
import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';

export function SpecializationSection({ specialization }) {
  if (!specialization) return null;

  const { primarySkills = [], tools = [], specializations = [] } = specialization;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <PsychologyIcon sx={{ color: '#00a1e0', fontSize: 28 }} />
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>
          Specializations
        </Typography>
      </Box>

      {/* Main Specializations */}
      {specializations.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#00a1e0', mb: 2 }}>
            Expertise
          </Typography>
          {specializations.map((spec, index) => (
            <Box
              key={index}
              sx={{
                backgroundColor: '#2a2e33',
                borderRadius: 1,
                p: 2,
                mb: 2,
                border: '1px solid #333'
              }}
            >
              <Typography variant="body1" sx={{ color: '#fff', fontWeight: 'bold' }}>
                {spec.skill}
              </Typography>
              <Typography variant="body2" sx={{ color: '#ccc', mt: 1 }}>
                Level: {spec.level} • {spec.yearsOfExperience} years experience
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Primary Skills */}
      {primarySkills.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#00a1e0', mb: 2 }}>
            Primary Skills
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {primarySkills.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                sx={{
                  backgroundColor: '#00a1e0',
                  color: '#fff',
                  '&:hover': { backgroundColor: '#007bb5' }
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Tools */}
      {tools.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ color: '#00a1e0', mb: 2 }}>
            Tools & Software
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {tools.map((tool, index) => (
              <Chip
                key={index}
                label={tool}
                variant="outlined"
                sx={{
                  borderColor: '#00a1e0',
                  color: '#00a1e0',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 161, 224, 0.1)',
                    borderColor: '#007bb5'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
