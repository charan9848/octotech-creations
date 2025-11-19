"use client";

import AdBanner from './AdBanner';
import { Box } from '@mui/material';

// Header Ad - Display at top of pages
export const HeaderAd = () => (
  <AdBanner 
    adSlot="1234567890"
    style={{ 
      marginBottom: '2rem',
      minHeight: '90px',
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      borderRadius: '8px',
      padding: '10px'
    }}
  />
);

// Sidebar Ad - For desktop layouts
export const SidebarAd = () => (
  <AdBanner 
    adSlot="2345678901"
    adFormat="vertical"
    fullWidthResponsive={false}
    style={{ 
      width: '300px', 
      minHeight: '600px',
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      borderRadius: '8px',
      padding: '10px'
    }}
  />
);

// Footer Ad - Display at bottom
export const FooterAd = () => (
  <AdBanner 
    adSlot="3456789012"
    style={{ 
      marginTop: '2rem',
      minHeight: '90px',
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      borderRadius: '8px',
      padding: '10px'
    }}
  />
);

// In-Feed Ad - Between content sections
export const InFeedAd = () => (
  <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
    <AdBanner 
      adSlot="4567890123"
      style={{ 
        maxWidth: '728px',
        width: '100%',
        minHeight: '90px',
        backgroundColor: 'rgba(50, 180, 222, 0.08)',
        borderRadius: '8px',
        border: '1px solid rgba(50, 180, 222, 0.2)',
        padding: '10px'
      }}
    />
  </Box>
);

// Responsive Display Ad
export const ResponsiveAd = ({ slot }) => (
  <Box sx={{ my: 3, width: '100%' }}>
    <AdBanner 
      adSlot={slot || "5678901234"}
      style={{ 
        minHeight: '280px',
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: '8px',
        padding: '10px'
      }}
    />
  </Box>
);

export default {
  HeaderAd,
  SidebarAd,
  FooterAd,
  InFeedAd,
  ResponsiveAd
};
