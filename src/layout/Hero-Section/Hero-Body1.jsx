'use client';

import { motion } from 'framer-motion';

import { Box, Typography } from "@mui/material";
import MovieFilterOutlinedIcon from '@mui/icons-material/MovieFilterOutlined';
import AnimationOutlinedIcon from '@mui/icons-material/AnimationOutlined';
import CenterFocusStrongOutlinedIcon from '@mui/icons-material/CenterFocusStrongOutlined';
import ContentCutOutlinedIcon from '@mui/icons-material/ContentCutOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import React from 'react'

import { fadeIn } from "@/app/variants";

const HeroBody1 = () => {
  const services = [
    {
      id: "1",
      title: 'VFX (Visual Effects)',
      description: 'We add explosions, fire, smoke, and digital elements that bring your scenes to life. Perfect for films, commercials, and music videos.',
      icon: MovieFilterOutlinedIcon,
    },
    {
      id: "2",
      title: '3D Animation',
      description: 'Create dynamic characters, environments, and objects with smooth, high-quality motion. Perfect for storytelling and product showcases.',
      icon: AnimationOutlinedIcon,
    },
    {
      id: "3",
      title: 'Motion Tracking',
      description: 'We track camera movements to integrate 3D or VFX elements with real footage. Every frame feels like it belongs.',
      icon: CenterFocusStrongOutlinedIcon,
    },
    {
      id: "4",
      title: 'Rotoscoping',
      description: 'We separate characters or objects from the background with pixel-perfect masks. Great for compositing and background swaps.',
      icon: ContentCutOutlinedIcon,
    },
    {
      id: "5",
      title: 'Compositing',
      description: 'We blend layers, lighting, and effects into one polished shot. The result? A perfectly unified cinematic scene.',
      icon: LayersOutlinedIcon,
    },
    {
      id: "6",
      title: 'Motion Graphics & Titles',
      description: 'Bring your branding to life with animated intros, text, and visuals for ads, intros, and promos.',
      icon: TextFieldsOutlinedIcon,
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


