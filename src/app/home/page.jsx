export const metadata = {
  title: "Home | Octotech Creations",
  description: "At Octotech Creations, we turn that vision into visuals that sell, connect, and stay etched in the viewer's mind. We create visuals that drive results.",
};

import dynamic from 'next/dynamic';
import Hero from '@/layout/Hero-Section/Hero';
import { Box } from '@mui/material';
import clientPromise from "@/lib/mongodb";

const HeroBody1Scroll = dynamic(() => import('@/layout/Hero-Section/Hero-body1-scroll'));
const HeroBody1 = dynamic(() => import('@/layout/Hero-Section/Hero-Body1'));
const HeroBody2 = dynamic(() => import('@/layout/Hero-Section/Hero-body2'));
const HeroBody3 = dynamic(() => import('@/layout/Hero-Section/Hero-body3'));
const OurTeam = dynamic(() => import('@/layout/Hero-Section/artist-details/our-team'));
const Reviews = dynamic(() => import('@/layout/Hero-Section/testinomals/reviews'));

async function getHeroContent() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const content = await db.collection("siteContent").findOne({ section: 'hero' });
    return content ? JSON.parse(JSON.stringify(content)) : null;
  } catch (error) {
    console.error("Error fetching hero content:", error);
    return null;
  }
}

async function getServices() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const services = await db.collection("services").find({}).sort({ order: 1 }).toArray();
    return JSON.parse(JSON.stringify(services));
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

const HomeComponent = async () => {
  const heroContent = await getHeroContent();
  const services = await getServices();

  return (
  <Box>
    <section>
      <Hero content={heroContent} />
      <HeroBody1Scroll/>
      <HeroBody1 services={services}/>
      <HeroBody2 />
      <HeroBody3 />
      <OurTeam/>
      <Reviews/>
    </section>
  </Box>
)};

export default HomeComponent;