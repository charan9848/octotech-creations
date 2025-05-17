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
                        <Typography variant="h6" >We work with industry-standard software to deliver cinematic results with precision and creativity.</Typography>
                    </Box>
                    </motion.div>
                    <motion.div  variants={fadeIn('up', 0.5)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.5 }}>
                    <Box width="300px" m={1} pb={2}>
                        <Box 
                        component="img"
                        src="https://a-us.storyblok.com/f/1002378/413x45/5345ae6caa/software-icons.png"
                        alt="Software Icons"
                        sx={{
                            width: "100%", // Ensures the image takes the full width of the container
                            height: "auto", // Maintains the aspect ratio
                            borderRadius: "8px", // Adds rounded corners
                        }}
                        />
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