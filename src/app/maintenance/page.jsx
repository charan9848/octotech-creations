"use client";

import { Box, Typography, Container, Paper } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import { motion } from 'framer-motion';

export default function MaintenancePage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#15191c',
        backgroundImage: 'radial-gradient(circle at 50% 50%, #1a2027 0%, #0a0e12 100%)',
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={24}
            sx={{
              p: 6,
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
            }}
          >
            <ConstructionIcon sx={{ fontSize: 80, color: '#ff9800', mb: 3 }} />
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
              Under Maintenance
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4 }}>
              We are currently performing scheduled maintenance to improve your experience.
            </Typography>
            <Typography variant="body1" sx={{ color: '#32b4de' }}>
              We'll be back shortly!
            </Typography>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
