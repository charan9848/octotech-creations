'use client';

import { motion } from 'framer-motion';
import { fadeIn } from '@/app/variants';
import { Box, Typography } from "@mui/material";

const About = () => {
  return (
    <Box sx={{ backgroundColor: '#0B1113' }} p={5}>
      <Box
        m={5}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Box
          py={{ md: 5, xs: 2, sm: 3, lg: 5 }}
          pr={{ md: 4 }}
          textAlign={{ xs: 'center', md: 'start', sm: 'start' }}
        >
          <motion.div
            variants={fadeIn('right', 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.7 }}
          >
            <Box m={1}>
              <Typography variant="h4" color="white">
                About Us
              </Typography>
            </Box>
          </motion.div>
          <motion.div
            variants={fadeIn('right', 0.4)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.7 }}
          >
            <Box m={1} mb={3}>
              <Typography variant="h6" color="#aeb4b4">
                Octotech Creations is a VFX, Animation, and Compositing studio dedicated to bringing imagination to life. 
                Our team of passionate artists and technologists delivers pixel-perfect compositing, stunning 3D animation, 
                and cutting-edge motion graphics for films, advertisements, and brands. We blend creativity with technology 
                to elevate your visual storytelling and help you stand out in a digital world.
              </Typography>
            </Box>
          </motion.div>
          <motion.div
            variants={fadeIn('up', 0.5)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
          >
            <Box width="300px" m={1} pb={2}>
              <Box
                component="img"
                src="https://a-us.storyblok.com/f/1002378/413x45/5345ae6caa/software-icons.png"
                alt="Software Icons"
                sx={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "8px",
                }}
              />
            </Box>
          </motion.div>
        </Box>
        <Box>
          <motion.div
            variants={fadeIn('left', 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.7 }}
          >
            <Box
              component="img"
              src="https://www.actionvfx.com/img/home/artist.jpg"
              alt="Artist"
              sx={{
                width: "100%",
                height: "auto",
                borderRadius: "8px",
              }}
            />
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default About;