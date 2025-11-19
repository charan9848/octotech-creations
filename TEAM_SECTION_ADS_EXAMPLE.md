# 🎯 Quick Example: Add Ads to Our Team Section

## Current File
`src/layout/Hero-Section/artist-details/our-team.jsx`

## How to Add Ads

### Step 1: Import the Ad Component
```javascript
import { InFeedAd } from '@/components/AdSense/AdPlacements';
// or
import AdBanner from '@/components/AdSense/AdBanner';
```

### Step 2: Add Ad Before Team Section
```javascript
<Box sx={{...}}>
  {/* Add this ad at the top */}
  <Box mb={4}>
    <AdBanner 
      adSlot="YOUR_SLOT_ID"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        padding: '10px',
        minHeight: '90px'
      }}
    />
  </Box>

  <Box textAlign="center">
    <Typography variant="h1" color="white">Our Team</Typography>
    {/* ... rest of your code */}
  </Box>
</Box>
```

### Step 3: Add Ad After Team Cards
```javascript
</Box> {/* End of team cards box */}

{/* Add this ad at the bottom */}
<Box mt={4}>
  <AdBanner 
    adSlot="YOUR_SLOT_ID"
    style={{
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      padding: '10px',
      minHeight: '90px'
    }}
  />
</Box>

</motion.div>
```

## Complete Example Code

```javascript
"use client";

import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, IconButton, Typography } from '@mui/material';
import React from 'react'
import { red } from '@mui/material/colors';
import InstagramIcon from '@mui/icons-material/Instagram';
import { motion } from 'framer-motion';
import { fadeIn } from "@/app/variants";
import AdBanner from '@/components/AdSense/AdBanner'; // ADD THIS

const OurTeam = () => {
  // ... teams data ...

  return (
    <Box position="relative" sx={{...}}>
      <video>...</video>
      
      <Box sx={{...}}>
        {/* TOP AD */}
        <Box mb={4}>
          <AdBanner 
            adSlot="1234567890"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '10px',
              minHeight: '90px'
            }}
          />
        </Box>

        <Box textAlign="center">
          <Typography variant="h1" color="white">Our Team</Typography>
          {/* ... */}
        </Box>

        <motion.div>
          <Box my={3}>
            {/* TEAM CARDS */}
          </Box>
        </motion.div>

        {/* BOTTOM AD */}
        <Box mt={4}>
          <AdBanner 
            adSlot="0987654321"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '10px',
              minHeight: '90px'
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default OurTeam;
```

## Alternative: Use Pre-built Components

```javascript
import { InFeedAd } from '@/components/AdSense/AdPlacements';

// In your component
<InFeedAd /> // That's it! Pre-styled and ready
```

## Notes
- Replace `"1234567890"` with your actual ad slot IDs from AdSense dashboard
- Ads will only show after AdSense approval
- Test on production domain (octotechcreations.com)
