'use client';

import { motion } from 'framer-motion';

import { Box, Typography } from "@mui/material";
import MovieFilterOutlinedIcon from '@mui/icons-material/MovieFilterOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import TitleOutlinedIcon from '@mui/icons-material/TitleOutlined';
import ThreeDRotationOutlinedIcon from '@mui/icons-material/ThreeDRotationOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import ColorLensOutlinedIcon from '@mui/icons-material/ColorLensOutlined';
import React from 'react'

import { fadeIn } from "@/app/variants";

const HeroBody1 = () => {
  const services = [
    {
      id: "1",
      title: 'VIDEO EDITING',
      description: 'Professional video editing services with seamless cuts, color correction, and audio synchronization for films, commercials, and content.',
      icon: MovieFilterOutlinedIcon,
    },
    {
      id: "2",
      title: 'VFX',
      description: 'We add explosions, fire, smoke, and digital elements that bring your scenes to life. Perfect for films, commercials, and music videos.',
      icon: AutoFixHighOutlinedIcon,
    },
    {
      id: "3",
      title: 'REELS',
      description: 'Create engaging short-form content for social media platforms with dynamic editing, effects, and optimized formatting.',
      icon: VideoLibraryOutlinedIcon,
    },
    {
      id: "4",
      title: 'MOTION GRAPHICS',
      description: 'Animated graphics, infographics, and visual elements that enhance your content with professional motion design.',
      icon: TimelineOutlinedIcon,
    },
    {
      id: "5",
      title: 'TITLES/LOGO ANIMATION',
      description: 'Bring your branding to life with animated logos, title sequences, and branded elements for professional presentation.',
      icon: TitleOutlinedIcon,
    },
    {
      id: "6",
      title: '3D CGI',
      description: 'Create stunning 3D computer-generated imagery, characters, environments, and objects with photorealistic quality.',
      icon: ThreeDRotationOutlinedIcon,
    },
    {
      id: "7",
      title: 'REAL ESTATE',
      description: 'Specialized video production for real estate including property tours, aerial footage, and virtual walkthroughs.',
      icon: HomeWorkOutlinedIcon,
    },
    {
      id: "8",
      title: 'DI-COLOUR GRADING',
      description: 'Professional digital intermediate color grading services to achieve cinematic looks and enhance the visual storytelling of your content.',
      icon: ColorLensOutlinedIcon,
    },
  ];

  return (
    <Box sx={{ backgroundColor: '#15191c' }} p={5} id="services">

      <Box sx={{ textAlign: "center" }} p={5} > 
        <motion.div
          variants={fadeIn('up', 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.7 }}>
          <Typography  variant="h3" p={1} color="white" sx={{ fontSize: '33px' }}>Our Services</Typography>
          <Typography variant="h6" color="#32b4de"  >Pixel-perfect compositing and animation solutions.</Typography>
        </motion.div>
      </Box>


      <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 5, padding: "50px" }}>
        {
          services.map(service => (
            <Box sx={{ display: "flex", justifyContent: 'center', textAlign: 'center', }} width="360px" key={service.id} >
              <Box >
                
                <Box p={1}>
                  <motion.div
                  variants={fadeIn('left', 0.2)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.7 }}
                  >
                  <service.icon sx={{ fontSize: 50 }} />
                  </motion.div>
                </Box>
                 <motion.div
                  variants={fadeIn('left', 0.3)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.7 }}
                  >
                <Typography variant="h3" color="white" sx={{ fontSize: '20px', fontWeight: 600 }}>{service.title}</Typography>
               
                </motion.div>
                <motion.div 
                variants={fadeIn('left', 0.5)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.7 }}
                  >
                 <Typography p={2} variant="h6" sx={{ fontSize: '13px' }}>{service.description}</Typography>
                </motion.div>
              </Box>
            </Box>
          ))
        }
      </Box>
    </Box>
  );
}


export default HeroBody1


