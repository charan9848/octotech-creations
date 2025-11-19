/**
 * Example: How to Add Google AdSense Ads to Your Pages
 * 
 * This file demonstrates various ways to integrate AdSense ads
 * into your Next.js pages using the AdSense components.
 */

"use client";

import { Box, Container, Typography, Grid } from '@mui/material';
import { 
  HeaderAd, 
  InFeedAd, 
  FooterAd, 
  SidebarAd,
  ResponsiveAd 
} from '@/components/AdSense/AdPlacements';
import AdBanner from '@/components/AdSense/AdBanner';

// ============================================
// Example 1: Simple Page with Ads
// ============================================
export function SimplePageWithAds() {
  return (
    <Container>
      {/* Header Ad - Top of page */}
      <HeaderAd />
      
      <Typography variant="h1">Page Title</Typography>
      <Typography>Your content here...</Typography>
      
      {/* In-Feed Ad - Between content */}
      <InFeedAd />
      
      <Typography>More content...</Typography>
      
      {/* Footer Ad - Bottom of page */}
      <FooterAd />
    </Container>
  );
}

// ============================================
// Example 2: Portfolio Page with Ads
// ============================================
export function PortfolioWithAds({ portfolioItems }) {
  return (
    <Container>
      <HeaderAd />
      
      <Typography variant="h1">Portfolio</Typography>
      
      <Grid container spacing={3}>
        {/* Show first 4 items */}
        {portfolioItems.slice(0, 4).map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <PortfolioCard item={item} />
          </Grid>
        ))}
        
        {/* Ad after first 4 items */}
        <Grid item xs={12}>
          <InFeedAd />
        </Grid>
        
        {/* Show remaining items */}
        {portfolioItems.slice(4).map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <PortfolioCard item={item} />
          </Grid>
        ))}
      </Grid>
      
      <FooterAd />
    </Container>
  );
}

// ============================================
// Example 3: Blog Post with Sidebar Ad
// ============================================
export function BlogPostWithAds() {
  return (
    <Container maxWidth="lg">
      <HeaderAd />
      
      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Typography variant="h1">Blog Post Title</Typography>
          <Typography>Blog content here...</Typography>
          
          {/* Ad in middle of content */}
          <Box my={4}>
            <ResponsiveAd slot="YOUR_SLOT_ID" />
          </Box>
          
          <Typography>More blog content...</Typography>
        </Grid>
        
        {/* Sidebar with Ad */}
        <Grid item xs={12} md={4}>
          <SidebarAd />
        </Grid>
      </Grid>
      
      <FooterAd />
    </Container>
  );
}

// ============================================
// Example 4: Custom Ad with Styling
// ============================================
export function CustomStyledAd() {
  return (
    <Box my={4}>
      <AdBanner 
        adSlot="YOUR_AD_SLOT_ID"
        adFormat="auto"
        fullWidthResponsive={true}
        style={{
          // Glass-morphism effect
          backgroundColor: 'rgba(50, 180, 222, 0.08)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(50, 180, 222, 0.2)',
          padding: '15px',
          minHeight: '90px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      />
    </Box>
  );
}

// ============================================
// Example 5: Conditional Ad Display
// ============================================
export function ConditionalAds({ showAds, userPremium }) {
  // Only show ads if user is not premium
  const shouldShowAds = showAds && !userPremium;
  
  return (
    <Container>
      {shouldShowAds && <HeaderAd />}
      
      <Typography>Your content...</Typography>
      
      {shouldShowAds && <InFeedAd />}
      
      <Typography>More content...</Typography>
      
      {shouldShowAds && <FooterAd />}
    </Container>
  );
}

// ============================================
// Example 6: Team Section with Ads
// ============================================
export function TeamSectionWithAds({ teams }) {
  return (
    <Box sx={{ backgroundColor: '#15191c', py: 5 }}>
      <Container>
        {/* Ad at top */}
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
        
        <Typography variant="h1" color="white" textAlign="center">
          Our Team
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {teams.map((team, index) => (
            <Grid item xs={12} sm={6} md={4} key={team.id}>
              <TeamCard team={team} />
            </Grid>
          ))}
        </Grid>
        
        {/* Ad at bottom */}
        <Box mt={6}>
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
      </Container>
    </Box>
  );
}

// ============================================
// Example 7: Multiple Ad Formats
// ============================================
export function MultipleAdFormats() {
  return (
    <Container>
      {/* Horizontal Banner */}
      <AdBanner 
        adSlot="SLOT_1"
        adFormat="horizontal"
        style={{ minHeight: '90px', marginBottom: '2rem' }}
      />
      
      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Typography>Main content...</Typography>
          
          {/* Rectangle Ad */}
          <Box my={3}>
            <AdBanner 
              adSlot="SLOT_2"
              adFormat="rectangle"
              fullWidthResponsive={false}
              style={{ minHeight: '250px' }}
            />
          </Box>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Vertical/Skyscraper Ad */}
          <AdBanner 
            adSlot="SLOT_3"
            adFormat="vertical"
            fullWidthResponsive={false}
            style={{ width: '300px', minHeight: '600px' }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

// ============================================
// Example 8: Responsive Mobile-First Ads
// ============================================
export function ResponsiveMobileAds() {
  return (
    <Container>
      {/* Desktop: 728x90, Mobile: 320x50 */}
      <Box 
        sx={{ 
          display: { xs: 'block', md: 'none' },
          mb: 2 
        }}
      >
        <AdBanner 
          adSlot="MOBILE_SLOT"
          style={{ minHeight: '50px' }}
        />
      </Box>
      
      <Box 
        sx={{ 
          display: { xs: 'none', md: 'block' },
          mb: 2 
        }}
      >
        <AdBanner 
          adSlot="DESKTOP_SLOT"
          style={{ minHeight: '90px' }}
        />
      </Box>
      
      <Typography>Your content...</Typography>
    </Container>
  );
}

// Dummy components for examples
const PortfolioCard = ({ item }) => <div>{item.title}</div>;
const TeamCard = ({ team }) => <div>{team.name}</div>;

export default {
  SimplePageWithAds,
  PortfolioWithAds,
  BlogPostWithAds,
  CustomStyledAd,
  ConditionalAds,
  TeamSectionWithAds,
  MultipleAdFormats,
  ResponsiveMobileAds
};
