'use client';

import { motion } from 'framer-motion';
import { fadeIn } from '@/app/variants';
import { Box, Button, Typography } from "@mui/material";

const HeroBody2 = () => {
    return (
        <Box
            sx={{
                backgroundColor: '#15191c',
                backgroundImage: 'url(https://a-us.storyblok.com/f/1002378/1920x823/670f75c65b/get-started.jpg)',
                backgroundSize: 'cover', // Ensures the image covers the entire area
                backgroundPosition: 'center', // Centers the image
                backgroundRepeat: 'no-repeat', // Prevents the image from repeating
                height: {
                    xs: 'auto', // Auto height for small screens
                    sm: '320px', // Full viewport height for larger screens
                    md: '320px', // Full viewport height
                }, // Full viewport height
            }}
            p={5}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: "center", alignItems: "center", textAlign: "center" }} mt={5}>
                <motion.div
                    variants={fadeIn('left', 0.2)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.7 }}>
                    <Box mt={5}>
                        <Typography variant="h4" color="white" py={1} >Unleash Your Creativity with Octotech</Typography>
                    </Box>
                   

                </motion.div>

                <motion.div
                 variants={fadeIn('right', 0.4)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.7 }}>
                     <Box mt={1}>
                        <Typography variant="h6"  >Join thousands of artists already using Octotech. Get instant access to our Free VFX and Practice Footage Libraries.</Typography>
                    </Box>
                </motion.div>

                <motion.div
                    variants={fadeIn('up', 0.6)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.7 }}>
                    
                <Box my={4}>
                    <Button variant="contained" size="large" sx={{ fontSize: "15px", backgroundColor: "Green", padding: "10px 40px" }} >Start free now</Button>
                </Box>
                </motion.div>
            </Box>


        </Box>
    )
}

export default HeroBody2