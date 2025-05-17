import Hero from '@/layout/Hero-Section/hero';
import HeroBody1 from '@/layout/Hero-Section/Hero-Body1';
import HeroBody2 from '@/layout/Hero-Section/Hero-body2';
import HeroBody3 from '@/layout/Hero-Section/Hero-body3';
import { Box } from '@mui/material';

const HomeComponent = () => (
  <Box>
    <section>
      <Hero />
      <HeroBody1/>
      <HeroBody2 />
      <HeroBody3 />
    </section>
  </Box>
);

export default HomeComponent;