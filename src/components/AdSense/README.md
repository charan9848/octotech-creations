# 📱 AdSense Components

React components for Google AdSense integration in Next.js.

## Components

### AdBanner
Base component for displaying ads.

```javascript
import AdBanner from '@/components/AdSense/AdBanner';

<AdBanner 
  adSlot="1234567890"
  adFormat="auto"
  fullWidthResponsive={true}
  style={{ minHeight: '90px' }}
/>
```

### Pre-built Placements

```javascript
import { 
  HeaderAd, 
  SidebarAd, 
  FooterAd, 
  InFeedAd, 
  ResponsiveAd 
} from '@/components/AdSense/AdPlacements';

// Use anywhere in your app
<HeaderAd />
<InFeedAd />
<FooterAd />
```

## Quick Usage

```javascript
"use client";
import { InFeedAd } from '@/components/AdSense/AdPlacements';

export default function MyPage() {
  return (
    <div>
      <h1>My Content</h1>
      <p>Some content...</p>
      
      {/* Ad will display here */}
      <InFeedAd />
      
      <p>More content...</p>
    </div>
  );
}
```

## Configuration

AdSense Client ID: `ca-pub-9290596302357676`

The AdSense script is already loaded in `src/app/layout.js`.

## Notes

- Replace placeholder slot IDs with real ad unit IDs from AdSense dashboard
- Wait for AdSense approval before seeing live ads
- Test on production domain for accurate results
- Maximum 3-4 ad units per page recommended

For detailed documentation, see [ADSENSE_IMPLEMENTATION.md](../../ADSENSE_IMPLEMENTATION.md)
