# 📱 Google AdSense Implementation Guide

## ✅ Implementation Status

### Completed Setup:
- [x] AdSense script added to `layout.js` 
- [x] Client ID configured: `ca-pub-9290596302357676`
- [x] `ads.txt` file properly configured
- [x] AdBanner component created
- [x] Pre-built ad placement components ready
- [x] Site verification code deployed

## 🚀 Quick Start

### 1. AdSense Component Usage

```javascript
import { InFeedAd, HeaderAd, FooterAd } from '@/components/AdSense/AdPlacements';

// In your page component
<HeaderAd />
<YourContent />
<InFeedAd />
<MoreContent />
<FooterAd />
```

### 2. Custom Ad Placement

```javascript
import AdBanner from '@/components/AdSense/AdBanner';

<AdBanner 
  adSlot="YOUR_AD_SLOT_ID"
  adFormat="auto"
  fullWidthResponsive={true}
  style={{ minHeight: '90px', margin: '20px 0' }}
/>
```

## 📋 Available Components

### 1. **AdBanner** (Base Component)
```javascript
<AdBanner 
  adSlot="1234567890"        // Your ad slot ID from AdSense
  adFormat="auto"            // 'auto', 'horizontal', 'vertical', 'rectangle'
  fullWidthResponsive={true} // Responsive sizing
  style={{}}                 // Custom styles
  className=""               // CSS class
/>
```

### 2. **HeaderAd**
- Display location: Top of pages
- Size: 90px minimum height
- Format: Horizontal/Auto

### 3. **SidebarAd**
- Display location: Desktop sidebar
- Size: 300x600px
- Format: Vertical

### 4. **FooterAd**
- Display location: Bottom of pages
- Size: 90px minimum height
- Format: Horizontal/Auto

### 5. **InFeedAd**
- Display location: Between content sections
- Size: 728px max width
- Format: Auto/Responsive

### 6. **ResponsiveAd**
- Display location: Anywhere
- Size: Fully responsive
- Format: Auto

## 🎯 Recommended Placements

### Home Page (`src/app/page.js`)
```javascript
import { HeaderAd, InFeedAd, FooterAd } from '@/components/AdSense/AdPlacements';

export default function Home() {
  return (
    <>
      <HeaderAd />
      <HeroSection />
      <InFeedAd />
      <AboutSection />
      <InFeedAd />
      <ServicesSection />
      <FooterAd />
    </>
  );
}
```

### Portfolio Page (`src/app/portfolio/[artistid]/page.jsx`)
```javascript
import { InFeedAd } from '@/components/AdSense/AdPlacements';

// Add between portfolio items
<Grid container spacing={3}>
  {portfolioItems.slice(0, 4).map(item => <PortfolioCard {...item} />)}
  <Grid item xs={12}>
    <InFeedAd />
  </Grid>
  {portfolioItems.slice(4).map(item => <PortfolioCard {...item} />)}
</Grid>
```

### Artist Dashboard
```javascript
import { SidebarAd } from '@/components/AdSense/AdPlacements';

<Grid container>
  <Grid item xs={12} md={9}>
    <DashboardContent />
  </Grid>
  <Grid item xs={12} md={3}>
    <SidebarAd />
  </Grid>
</Grid>
```

## ⚙️ Configuration

### Environment Variables (Optional)
```env
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=ca-pub-9290596302357676
NEXT_PUBLIC_ADSENSE_ENABLED=true
```

### Usage with Environment Variables
```javascript
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;
const ADS_ENABLED = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true';

export default function Page() {
  return (
    <>
      {ADS_ENABLED && <HeaderAd />}
      <Content />
    </>
  );
}
```

## 🔍 Verification Steps

### 1. Check Script Loading
```javascript
// In browser console
console.log(window.adsbygoogle);
// Should return an array
```

### 2. Verify ads.txt
- URL: `https://octotechcreations.com/ads.txt`
- Content: `google.com, pub-9290596302357676, DIRECT, f08c47fec0942fa0`

### 3. Test Ad Display
1. Deploy to production
2. Wait 24-48 hours for AdSense approval
3. Check ad rendering on live site

## 📊 Ad Placement Best Practices

### ✅ Do's:
- Place ads naturally within content flow
- Use 3-4 ad units per page maximum
- Test different placements for performance
- Monitor Core Web Vitals
- Ensure mobile responsiveness

### ❌ Don'ts:
- Don't place ads too close to navigation
- Don't use misleading ad placements
- Don't place multiple ads in viewport at once
- Don't block content with ads
- Don't click your own ads

## 🎨 Styling Tips

### Glass-morphism Ad Container
```javascript
<AdBanner 
  adSlot="1234567890"
  style={{
    backgroundColor: 'rgba(50, 180, 222, 0.08)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(50, 180, 222, 0.2)',
    padding: '15px',
    minHeight: '90px'
  }}
/>
```

### Dark Theme Integration
```javascript
<AdBanner 
  adSlot="1234567890"
  style={{
    backgroundColor: 'rgba(26, 30, 35, 0.3)',
    borderRadius: '8px',
    border: '1px solid rgba(51, 51, 51, 0.4)',
    padding: '10px',
    minHeight: '90px'
  }}
/>
```

## 🚨 Troubleshooting

### Ad Not Showing?
1. **Check AdSense approval status**
   - Login to AdSense dashboard
   - Verify site status

2. **Check browser console for errors**
   ```javascript
   // Look for AdSense errors
   window.adsbygoogle
   ```

3. **Verify ad blocker is disabled**

4. **Check ad slot ID**
   - Must be created in AdSense dashboard
   - Format: 10-digit number

### Blank Ad Space?
- AdSense may not have ads for your content yet
- Wait 24-48 hours after approval
- Check ad settings in AdSense dashboard

## 📈 Performance Monitoring

### Key Metrics to Track:
- **CTR (Click-Through Rate)**
- **CPC (Cost Per Click)**
- **RPM (Revenue Per Mille)**
- **Impressions**
- **Coverage**

### Access Reports:
1. Login to [AdSense Dashboard](https://www.google.com/adsense)
2. Navigate to Reports
3. Filter by date range
4. Analyze performance

## 🔒 Privacy & Compliance

### Required Pages:
- [x] Privacy Policy - `/privacy-policy`
- [ ] Terms of Service - `/terms`
- [ ] Cookie Policy - `/cookies`

### GDPR Compliance:
```javascript
// Implement consent management
import { CookieConsent } from '@/components/CookieConsent';

<CookieConsent 
  onAccept={() => {
    // Load ads
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }}
/>
```

## 📞 Support

### Google AdSense Resources:
- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Community](https://support.google.com/adsense/community)
- [Policy Center](https://support.google.com/adsense/answer/48182)

### Internal Support:
- Email: support@octotechcreations.com
- Documentation: `/docs/adsense`

## 🎯 Next Steps

1. **Wait for AdSense approval** (1-3 days)
2. **Create ad units** in AdSense dashboard
3. **Replace placeholder slot IDs** with real ones
4. **Test ad placements** on production
5. **Monitor performance** and optimize
6. **Add more strategic placements** based on data

---

**Last Updated:** November 19, 2025  
**AdSense Client ID:** ca-pub-9290596302357676  
**Site:** octotechcreations.com
