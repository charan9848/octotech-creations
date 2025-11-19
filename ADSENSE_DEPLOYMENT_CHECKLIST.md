# 🚀 AdSense Deployment Checklist

## ✅ Pre-Deployment Checks

- [x] AdSense script added to `src/app/layout.js`
- [x] `ads.txt` file exists in `public/` folder
- [x] AdSense components created
- [x] Documentation complete
- [ ] Ad slot IDs added to components
- [ ] Privacy policy page exists
- [ ] Cookie consent implemented (optional but recommended)

## 📋 Deployment Steps

### 1. Commit Your Changes
```bash
git add .
git commit -m "feat: implement Google AdSense integration"
git push
```

### 2. Deploy to Production
```bash
# If using Vercel
vercel --prod

# If using other hosting
npm run build
# Upload build files to your server
```

### 3. Verify Deployment
- [ ] Visit https://octotechcreations.com
- [ ] Check browser console for errors
- [ ] Verify AdSense script is loaded
- [ ] Check `https://octotechcreations.com/ads.txt`

### 4. Request AdSense Review
1. Go to [AdSense Dashboard](https://www.google.com/adsense)
2. Navigate to "Sites"
3. Click "Request Review" button
4. Wait 1-3 business days for approval

## 🔍 Verification Commands

```bash
# Check if ads.txt is accessible
curl https://octotechcreations.com/ads.txt

# Expected output:
# google.com, pub-9290596302357676, DIRECT, f08c47fec0942fa0
```

## 📊 Post-Approval Steps

### 1. Create Ad Units in AdSense
1. Login to AdSense dashboard
2. Go to "Ads" → "By ad unit"
3. Click "Display ads"
4. Create ad units for:
   - Header (728x90 or responsive)
   - Sidebar (300x600)
   - In-feed (responsive)
   - Footer (728x90 or responsive)

### 2. Update Component Slot IDs

Edit `src/components/AdSense/AdPlacements.jsx`:
```javascript
export const HeaderAd = () => (
  <AdBanner 
    adSlot="1234567890" // ← Replace with your ad unit ID
    style={{...}}
  />
);
```

### 3. Test Ad Display
- [ ] Wait 10-15 minutes after adding slot IDs
- [ ] Clear browser cache
- [ ] Disable ad blocker
- [ ] Visit your site and check ads

## 🎯 Recommended Ad Placements

### Home Page
```javascript
// src/app/page.js
import { HeaderAd, InFeedAd, FooterAd } from '@/components/AdSense/AdPlacements';

<HeaderAd />        // Top of page
<HeroSection />
<InFeedAd />        // Between sections
<AboutSection />
<InFeedAd />        // Between sections
<ServicesSection />
<FooterAd />        // Bottom of page
```

### Portfolio Pages
```javascript
// src/app/portfolio/[artistid]/page.jsx
<HeaderAd />
// Portfolio content
<InFeedAd />        // After 4-6 portfolio items
// More portfolio items
<FooterAd />
```

### Team Section
```javascript
// src/layout/Hero-Section/artist-details/our-team.jsx
<AdBanner />        // Top of section
// Team cards
<AdBanner />        // Bottom of section
```

## 📈 Performance Monitoring

### Week 1
- [ ] Check impression count
- [ ] Monitor page load speed
- [ ] Test on mobile devices
- [ ] Check ad viewability

### Week 2
- [ ] Review CTR (Click-Through Rate)
- [ ] Analyze best performing placements
- [ ] Adjust ad positions if needed
- [ ] A/B test different layouts

### Monthly
- [ ] Review revenue in AdSense dashboard
- [ ] Check Core Web Vitals
- [ ] Optimize low-performing pages
- [ ] Update ad strategies

## 🚨 Troubleshooting

### Ads Not Showing?
1. **Check approval status**
   - Visit AdSense dashboard
   - Look for approval notification

2. **Verify script loading**
   ```javascript
   // In browser console
   console.log(window.adsbygoogle);
   ```

3. **Check slot IDs**
   - Must be 10-digit numbers
   - Created in AdSense dashboard
   - Correctly added to components

4. **Wait time**
   - New ad units: 10-15 minutes
   - New sites: 24-48 hours
   - Low traffic: May have no ads initially

### Blank Ad Space?
- AdSense may not fill all impressions
- Check ad settings in dashboard
- Ensure content complies with policies
- Verify sufficient content on page

### Performance Issues?
- Limit to 3-4 ads per page
- Use `loading="lazy"` where possible
- Monitor Core Web Vitals
- Consider async loading

## 📞 Support Resources

- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Community](https://support.google.com/adsense/community)
- [Policy Center](https://support.google.com/adsense/answer/48182)
- [Performance Guide](https://support.google.com/adsense/answer/6162415)

## ✅ Final Checklist

Before going live:
- [ ] All files committed and pushed
- [ ] Production build successful
- [ ] Site accessible at octotechcreations.com
- [ ] AdSense script loading correctly
- [ ] ads.txt file accessible
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Privacy policy accessible
- [ ] Request review submitted

After approval:
- [ ] Ad units created in dashboard
- [ ] Slot IDs added to components
- [ ] Ads displaying correctly
- [ ] Performance monitored
- [ ] Revenue tracking set up

---

**Site:** octotechcreations.com  
**AdSense ID:** ca-pub-9290596302357676  
**Status:** ⏳ Awaiting approval  
**Next Action:** Deploy and request review
