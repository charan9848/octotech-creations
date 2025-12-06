'use client';

import { Box, Typography } from '@mui/material'
import React, { useState, useRef } from 'react'
import {
  Movie, Brush, Animation, ThreeDRotation, Home,
  ColorLens, VideoCameraBack, AutoFixHigh, Web, DesignServices,
  Camera, Mic, MusicNote, Palette, Computer, Help,
  MovieFilter, SlowMotionVideo, Timeline, Title, HomeWork,
  PlayArrow
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { fadeIn } from '@/app/variants';

const ICON_MAP = {
  "MovieFilter": MovieFilter, // Video Editing
  "AutoFixHigh": AutoFixHigh, // VFX
  "SlowMotionVideo": SlowMotionVideo, // Reels
  "Timeline": Timeline, // Motion Graphics
  "Title": Title, // Titles/Logo Animation
  "ThreeDRotation": ThreeDRotation, // 3D CGI
  "HomeWork": HomeWork, // Real Estate
  "Palette": Palette, // DI-Colour Grading

  // Keep others for flexibility
  "Movie": Movie,
  "Brush": Brush,
  "Animation": Animation,
  "Home": Home,
  "ColorLens": ColorLens,
  "VideoCameraBack": VideoCameraBack,
  "Web": Web,
  "DesignServices": DesignServices,
  "Camera": Camera,
  "Mic": Mic,
  "MusicNote": MusicNote,
  "Computer": Computer
};

const ServiceSection = ({ title, description, image, icon, index }) => {
    const isEven = index % 2 === 0;
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Dynamically get the icon component, fallback to Help icon if not found
    const IconComponent = ICON_MAP[icon] || Help;

    const isVideo = (url) => {
        return url && (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg') || url.includes('/video/upload/'));
    };

    const handlePlay = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    return (
        <Box sx={{ backgroundColor: '#15191c', borderBottom: '1px solid rgba(255,255,255,0.1)' }} py={2} px={{xs: 2, md: 8}}>
            <Box sx={{ 
                display: "flex", 
                flexDirection: { xs: "column", sm: isEven ? "row" : "row-reverse" }, 
                justifyContent: "space-between", 
                alignItems: "center",
                gap: { xs: 2, md: 6 }
            }}> 
                {/* Text Section */}
                <Box 
                    flex={1} 
                    py={{md:5, xs:2, sm:3, lg:5}} 
                    textAlign={{xs:'center', md:'start', sm:'start'}}
                >
                    <motion.div 
                        variants={fadeIn(isEven ? 'right' : 'left', 0.2)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <Box m={1} sx={{ display: 'flex', justifyContent: {xs: 'center', md: 'flex-start'} }}>
                            <IconComponent sx={{ fontSize: 50, color: '#00B2FF' }} />
                        </Box>
                        <Box m={1} >
                            <Typography variant="h4" color="white">{title}</Typography>
                        </Box>
                    </motion.div>
                    <motion.div
                        variants={fadeIn(isEven ? 'right' : 'left', 0.4)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <Box m={1} mb={3}>
                            <Typography variant="h6" sx={{ lineHeight: 1.8, color: '#aeb4b4', fontSize: '16px' }}>
                                {description}
                            </Typography>
                        </Box>
                    </motion.div>
                </Box>

                {/* Image Section */}
                <Box flex={1} display="flex" justifyContent={isEven ? "flex-end" : "flex-start"} width="100%">
                    <motion.div
                        variants={fadeIn(isEven ? 'left' : 'right', 0.2)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.3 }}
                        style={{ width: '100%', display: 'flex', justifyContent: isEven ? 'flex-end' : 'flex-start' }}
                    >
                        {isVideo(image) ? (
                            <Box position="relative" width="100%" maxWidth="600px">
                                <Box 
                                    component="video"
                                    ref={videoRef}
                                    src={image}
                                    loop
                                    playsInline
                                    controls={isPlaying}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    sx={{
                                        width: "100%",
                                        height: "auto",
                                        borderRadius: "8px",
                                        boxShadow: 3,
                                        border: '1px solid #333',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                />
                                {!isPlaying && (
                                    <Box 
                                        onClick={handlePlay}
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: 'rgba(0,0,0,0.3)',
                                            cursor: 'pointer',
                                            borderRadius: '8px',
                                            transition: '0.3s',
                                            '&:hover': {
                                                bgcolor: 'rgba(0,0,0,0.5)',
                                                '& .play-icon': {
                                                    transform: 'scale(1.1)'
                                                }
                                            }
                                        }}
                                    >
                                        <PlayArrow className="play-icon" sx={{ fontSize: 80, color: 'white', transition: '0.2s' }} />
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            <Box 
                                component="img"
                                src={image || "https://placehold.co/600x400/1a1a1a/white?text=Service+Preview"}
                                alt={`${title} Preview`}
                                sx={{
                                    width: "100%",
                                    maxWidth: "600px",
                                    height: "auto",
                                    borderRadius: "8px",
                                    boxShadow: 3,
                                    border: '1px solid #333'
                                }}
                            />
                        )}
                    </motion.div>
                </Box>
            </Box>
        </Box>
    )
}

export default ServiceSection
