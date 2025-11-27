import React from 'react';
import { Box, Container, Typography } from '@mui/material';

export const metadata = {
  title: 'Privacy Policy | OctoTech Creations',
  description: 'Privacy Policy for OctoTech Creations. Learn how we handle your data.',
};

const PrivacyPolicy = () => {
  return (
    <Box sx={{ backgroundColor: '#0B1113', minHeight: '100vh', py: 15, color: '#aeb4b4' }}>
      <Container maxWidth="md">
        <Typography variant="h3" color="white" mb={4} sx={{ fontFamily: 'Eurostile, sans-serif' }}>
          Privacy Policy
        </Typography>
        
        <Typography paragraph>Last updated: November 27, 2025</Typography>

        <Typography variant="h5" color="white" mt={4} mb={2}>1. Introduction</Typography>
        <Typography paragraph>
          Welcome to OctoTech Creations. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
        </Typography>

        <Typography variant="h5" color="white" mt={4} mb={2}>2. Data We Collect</Typography>
        <Typography paragraph>
          We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
          <ul>
            <li>Identity Data: includes first name, last name, username or similar identifier.</li>
            <li>Contact Data: includes email address and telephone numbers.</li>
            <li>Technical Data: includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
          </ul>
        </Typography>

        <Typography variant="h5" color="white" mt={4} mb={2}>3. How We Use Your Data</Typography>
        <Typography paragraph>
          We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          <ul>
            <li>To provide the services you have requested (e.g., contacting us for VFX work).</li>
            <li>To improve our website and user experience.</li>
            <li>To send you promotional emails (if you have opted in).</li>
          </ul>
        </Typography>

        <Typography variant="h5" color="white" mt={4} mb={2}>4. Cookies</Typography>
        <Typography paragraph>
          We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
        </Typography>

        <Typography variant="h5" color="white" mt={4} mb={2}>5. Third-Party Services</Typography>
        <Typography paragraph>
          We may employ third-party companies (like Google Analytics, Google AdSense) to facilitate our Service, to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used.
        </Typography>

        <Typography variant="h5" color="white" mt={4} mb={2}>6. Contact Us</Typography>
        <Typography paragraph>
          If you have any questions about this Privacy Policy, please contact us:
          <br />
          By email: octotechcreations@gmail.com
        </Typography>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
