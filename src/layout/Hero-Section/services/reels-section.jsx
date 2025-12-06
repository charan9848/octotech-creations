'use client';

import { Box, Typography } from '@mui/material'
import React from 'react'
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import { motion } from 'framer-motion';
import { fadeIn } from '@/app/variants';

const ReelsSection = () => {
    return (
        <Box sx={{ backgroundColor: '#15191c', borderBottom: '1px solid rgba(255,255,255,0.1)' }} py={2} px={{xs: 2, md: 8}}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: "center" }}> 
                <Box py={{md:5, xs:2, sm:3, lg:5}} pr={{md:4}} textAlign={{xs:'center',md:'start', sm:'start'}}>
                    <motion.div 
                    variants={fadeIn('right', 0.2)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.7 }}>
                        <Box m={1} sx={{ display: 'flex', justifyContent: {xs: 'center', md: 'flex-start'} }}>
                            <VideoLibraryOutlinedIcon sx={{ fontSize: 50, color: '#00B2FF' }} />
                        </Box>
                        <Box m={1} >
                            <Typography variant="h4" color="white">REELS</Typography>
                        </Box>
                    </motion.div>
                    <motion.div
                     variants={fadeIn('right', 0.4)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.7 }}>
                        <Box m={1} mb={3}>
                            <Typography variant="h6" sx={{ lineHeight: 1.8, color: '#aeb4b4', fontSize: '16px' }}>
                                Create engaging short-form content for social media platforms with dynamic editing, effects, and optimized formatting.
                            </Typography>
                        </Box>
                    </motion.div>
                </Box>
                <Box>
                    <motion.div
                        variants={fadeIn('left', 0.2)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.7 }}>
                        <Box 
                            component="img"
                            src="https://placehold.co/600x400/1a1a1a/white?text=Reels+Preview"
                            alt="Reels Preview"
                            sx={{
                                width: "100%",
                                maxWidth: "600px",
                                height: "auto",
                                borderRadius: "8px",
                                boxShadow: 3,
                                border: '1px solid #333'
                            }}
                        />
                    </motion.div>
                </Box>
            </Box>
        </Box>
    )
}

export default ReelsSection
