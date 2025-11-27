'use client';

import { motion } from 'framer-motion';
import { fadeIn } from '@/app/variants';
import { Box, Typography } from "@mui/material";

const HeroBody3 = () => {
  return (
      <Box sx={{ backgroundColor: '#0B1113' }} p={5}>
            <Box m={5} sx={{ display:"flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: "center" }}>
                <Box   py={{md:5, xs:2, sm:3, lg:5}} pr={{md:4}} textAlign={{xs:'center',md:'start', sm:'start' }} >
                    <motion.div 
                    variants={fadeIn('right', 0.2)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.7 }}>
                    <Box m={1} >
                        <Typography variant="h4" color="white">We Master</Typography>
                    </Box>
                    </motion.div>
                    <motion.div
                     variants={fadeIn('right', 0.4)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.7 }}>
                    <Box m={1} mb={3}>
                        <Typography variant="h6" sx={{ lineHeight: 1.8, color: '#aeb4b4', fontSize: '16px' }}>
                            We harness the full potential of industry-leading tools to craft breathtaking visuals. From advanced compositing in Nuke and After Effects to immersive 3D worlds in Blender, and precise storytelling in Premiere Pro, our technical mastery ensures every frame is a masterpiece.
                        </Typography>
                    </Box>
                    </motion.div>
                    <motion.div  variants={fadeIn('up', 0.5)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.5 }}>
                    <Box width="100%" maxWidth="400px" m={1} pb={2}>
                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                            {[
                                { name: 'After Effects', src: '/software-icons/Ae.png' },
                                { name: 'Premiere Pro', src: '/software-icons/Pr.png' },
                                { name: 'Photoshop', src: '/software-icons/Ps.png' },
                                { name: 'Illustrator', src: '/software-icons/Ai.png' },
                                { name: 'Blender', src: '/software-icons/Blender.png' },
                                { name: 'Nuke', src: '/software-icons/Nuke.png' },
                            ].map((sw) => (
                                <Box 
                                    key={sw.name}
                                    component="img"
                                    src={sw.src}
                                    alt={sw.name}
                                    sx={{
                                        width: "45px",
                                        height: "45px",
                                        objectFit: "contain",
                                        filter: "grayscale(0%)",
                                        transition: "transform 0.3s ease",
                                        '&:hover': {
                                            transform: "scale(1.1)",
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                    </motion.div>
                </Box>
                <Box >
                    <motion.div
                        variants={fadeIn('left', 0.2)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.7 }}>
                    <Box
                        component="img"
                        src="https://www.actionvfx.com/img/home/artist.jpg"
                        alt="Artist"
                        sx={{
                            width: "100%", // Ensures the image takes the full width of the container
                            height: "auto", // Maintains the aspect ratio
                            borderRadius: "8px", // Adds rounded corners
                        }}
                    />
                    </motion.div>

                </Box>

            </Box>

        </Box>
  )
}

export default HeroBody3