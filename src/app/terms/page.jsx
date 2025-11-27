import React from 'react';
import { Box, Container, Typography } from '@mui/material';

export const metadata = {
  title: 'Terms & Conditions | OctoTech Creations',
  description: 'Terms and Conditions for using OctoTech Creations website and services.',
};

const Terms = () => {
  return (
    <Box sx={{ backgroundColor: '#0B1113', minHeight: '100vh', py: 15, color: '#aeb4b4' }}>
      <Container maxWidth="md">
        <Typography variant="h3" color="white" mb={4} sx={{ fontFamily: 'Eurostile, sans-serif' }}>
          Terms & Conditions
        </Typography>
        
        <Typography paragraph>Last updated: November 27, 2025</Typography>

        <Typography variant="h5" color="white" mt={4} mb={2}>1. Agreement to Terms</Typography>
        <Typography paragraph>
          These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and OctoTech Creations ("we," "us" or "our"), concerning your access to and use of the OctoTech Creations website.
        </Typography>

        <Typography variant="h5" color="white" mt={4} mb={2}>2. Intellectual Property Rights</Typography>
        <Typography paragraph>
          Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us.
        </Typography>

        <Typography variant="h5" color="white" mt={4} mb={2}>3. User Representations</Typography>
        <Typography paragraph>
          By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary.
        </Typography>

        <Typography variant="h5" color="white" mt={4} mb={2}>4. Prohibited Activities</Typography>
        <Typography paragraph>
          You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
        </Typography>

        <Typography variant="h5" color="white" mt={4} mb={2}>5. Contact Us</Typography>
        <Typography paragraph>
          In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: octotechcreations@gmail.com
        </Typography>
      </Container>
    </Box>
  );
};

export default Terms;
