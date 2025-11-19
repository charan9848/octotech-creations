# 🚀 AdSense Quick Reference

## 📥 Import
```javascript
import { InFeedAd, HeaderAd, FooterAd } from '@/components/AdSense/AdPlacements';
// or
import AdBanner from '@/components/AdSense/AdBanner';
```

## 🎯 Usage

### Simple (Recommended)
```javascript
<InFeedAd />
```

### Custom
```javascript
<AdBanner 
  adSlot="1234567890"
  adFormat="auto"
  style={{ minHeight: '90px' }}
/>
```

## 📋 Ad Slots (After Approval)

Once approved, create ad units in AdSense dashboard and update:

| Component | Replace | With Your Slot ID |
|-----------|---------|-------------------|
| HeaderAd | "1234567890" | Your header slot |
| InFeedAd | "4567890123" | Your in-feed slot |
| FooterAd | "3456789012" | Your footer slot |
| SidebarAd | "2345678901" | Your sidebar slot |

## 🔧 Component Props

```javascript
<AdBanner 
  adSlot="string"              // Required: Your ad unit ID
  adFormat="auto|horizontal|vertical|rectangle"  // Default: "auto"
  fullWidthResponsive={true}   // Default: true
  style={{}}                   // Optional: Custom styles
  className=""                 // Optional: CSS class
/>
```

## 📍 Common Placements

```javascript
// Top of page
<HeaderAd />

// Between content sections
<Section1 />
<InFeedAd />
<Section2 />

// Bottom of page
<FooterAd />

// Desktop sidebar
<Grid container>
  <Grid item xs={12} md={8}>
    <Content />
  </Grid>
  <Grid item xs={12} md={4}>
    <SidebarAd />
  </Grid>
</Grid>
```

## ⚙️ Configuration

**Client ID:** ca-pub-9290596302357676  
**Site:** octotechcreations.com  
**Script:** Already in `layout.js`  
**ads.txt:** Already configured

## 📚 Full Docs

- `ADSENSE_IMPLEMENTATION.md` - Complete guide
- `ADSENSE_DEPLOYMENT_CHECKLIST.md` - Deploy steps
- `ADSENSE_STATUS.md` - Current status
- `src/components/AdSense/examples.jsx` - Code examples

## 🚀 Deploy Now

```bash
git add .
git commit -m "feat: add AdSense"
git push
vercel --prod
```

Then request review in AdSense dashboard!
