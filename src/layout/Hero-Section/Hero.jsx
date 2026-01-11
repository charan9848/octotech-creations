'use client';
import { motion } from 'framer-motion';
import { fadeIn } from '@/app/variants';
import { Box, Typography, Button } from "@mui/material";
import ExploreIcon from '@mui/icons-material/Explore';
import React, { useEffect, useRef } from "react";
import Image from 'next/image';

const Hero = ({ content }) => {
  const title = content?.title || "Production-quality VFX and 3D for movies";
  const subtitle = content?.subtitle || "Welcome to Octotech Creations, where imagination meets reality.";
  const videoUrl = content?.videoUrl || "https://res.cloudinary.com/djbilxr7i/video/upload/q_auto,f_auto/v1768124432/hero-video-compressed_xiscj2.mp4";
  // Prefer a local optimized poster (place optimized file at public/images/hero-1920x700.jpg)
  const posterUrl = content?.posterUrl || "/images/hero-1920x700.jpg";

  const videoRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
      {/* Video Background (hidden on xs) */}
      <Box
        sx={{
          display: { xs: "none", sm: "block" },
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        <video
          ref={videoRef}
          className="video-background"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
          preload="none"
          loop
          muted
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          poster={posterUrl}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      </Box>

      {/* Image Background (only on xs) */}
      <Box
        sx={{
          display: { xs: "block", sm: "none" },
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <Image
            src={posterUrl}
            alt="Hero background"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
          />
        </Box>
      </Box>

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
            <Typography variant="h3" sx={{ WebkitTextStroke: '0.5px white', fontSize: { xs: "30px", sm: "40px", md: "50px" } }}>
              {/* If content is provided, render it as HTML to support basic styling if user inputs it, otherwise just text */}
              {content?.title ? (
                 <span dangerouslySetInnerHTML={{ __html: title }} />
              ) : (
                <>
                  Production-quality
                  <span style={{ color: '#32b4de', WebkitTextStroke: '0.5px #32b4de' }}> VFX </span>
                  and
                  <span style={{ color: '#32b4de', WebkitTextStroke: '0.5px #32b4de' }}> 3D </span>
                  for movies
                </>
              )}
            </Typography>
          </motion.div>
          <motion.div
            variants={fadeIn('left', 0.4)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.7 }}>
            <Typography variant="body1" mt={2} color="#aeb4b4">
              {subtitle}
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
              onClick={() => {
                const element = document.getElementById('services');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
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
