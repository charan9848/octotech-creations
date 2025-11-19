"use client";

import { useEffect } from 'react';
import { Box } from '@mui/material';

const AdBanner = ({ 
  adSlot, 
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = {},
  className = '' 
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <Box className={className} sx={{ 
      textAlign: 'center',
      overflow: 'hidden',
      ...style 
    }}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
        }}
        data-ad-client="ca-pub-9290596302357676"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </Box>
  );
};

export default AdBanner;
