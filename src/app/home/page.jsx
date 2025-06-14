export const metadata = {
  title: "Home | Octotech Creations",
  description: "Welcome to Octotech Creations – your destination for high-quality VFX, 2D/3D editing, and Photoshop resources. Elevate your visuals with our creative expertise and powerful library.",
};

import OurTeam from '@/layout/Hero-Section/artist-details/our-team';
import Hero from '@/layout/Hero-Section/Hero';
import HeroBody1 from '@/layout/Hero-Section/Hero-Body1';
import HeroBody1Scroll from '@/layout/Hero-Section/Hero-body1-scroll';
import HeroBody2 from '@/layout/Hero-Section/Hero-body2';
import HeroBody3 from '@/layout/Hero-Section/Hero-body3';
import VideoEditingSection from '@/layout/Hero-Section/services/video-editing-section';
import Reviews from '@/layout/Hero-Section/testinomals/reviews';
import { Box } from '@mui/material';

const HomeComponent = () => (
  <Box>
    <section>
      <Hero />
      <HeroBody1Scroll/>
      <HeroBody1/>
      {/* <VideoEditingSection/> */}
      <HeroBody2 />
      <HeroBody3 />
      <OurTeam/>
      <Reviews/>
    </section>
  </Box>
);

export default HomeComponent;