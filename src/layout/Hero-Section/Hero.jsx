'use client';
import { motion } from 'framer-motion';
import { fadeIn } from '@/app/variants';
import { Box, Typography, Button } from "@mui/material";
import ExploreIcon from '@mui/icons-material/Explore';
import React from "react";

const Hero = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: { xs: "500px", sm: "660px", md: "648px", xl: "724px" },
        display: "flex",
        alignItems: "center",
        position: "relative",
        zIndex: 30,
        overflow: "hidden",
      }}
    >
      {/* Video Background */}
      <video
        className="video-background"
        style={{
          position: "absolute",
          zIndex: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}
        preload="auto"
        autoPlay
        loop
        muted
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        poster="https://a-us.storyblok.com/f/1002378/1920x700/9dcc42a9b1/front_page_static_banner.jpg"
      >
        <source src="https://a-us.storyblok.com/f/1002378/x/1f6178b540/actionvfxfrontpage15.mp4" type="video/mp4" />
      </video>

      {/* Shading Overlay */}
      <Box
        sx={{
          position: "absolute",
          zIndex: 1,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.5)",
        }}
      />

      {/* Content Overlay */}
      <Box
        sx={{
          position: "relative",
          zIndex: 3,
          color: "white",
          width: "100%",
          display: "flex",
          justifyContent: { xs: "center", sm: "center", md: "flex-start" },
          alignItems: { xs: "center", sm: "center", md: "flex-start" },
          padding: { xs: "20px", sm: "40px", md: "50px" },
          marginBottom: "40px",
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", sm: "80%", md: "55%", xl: "45%" },
            display: "flex",
            flexDirection: "column",
            padding: "40px",
          }}
        >
          <motion.div
            variants={fadeIn('left', 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.7 }}>
          <Typography variant="h3" sx={{ WebkitTextStroke: '0.5px white' , fontSize: { xs: "30px", sm: "40px", md: "50px" } }}>
            Production-quality
            <span style={{ color: '#32b4de', WebkitTextStroke: '0.5px #32b4de' }}> VFX </span>
            and
            <span style={{ color: '#32b4de', WebkitTextStroke: '0.5px #32b4de' }}> 3D </span>
            for movies
          </Typography>
          </motion.div>
          <motion.div
            variants={fadeIn('left', 0.4)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.7 }}>
          <Typography variant="body1" mt={2} color="#aeb4b4">
            Welcome to Octotech Creations, where imagination meets reality.
          </Typography>
          </motion.div>
          <motion.div
            variants={fadeIn('up', 0.6)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.7 }}>
          <Button
            variant="outlined"
            sx={{ marginTop: "30px", width: "150px" }}
            endIcon={<ExploreIcon />}
          >
            Explore
          </Button>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default Hero;