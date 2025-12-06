'use client';

import { motion } from 'framer-motion';
import { Box, Typography } from "@mui/material";
import React from 'react'
import { fadeIn } from "@/app/variants";
import ServiceSection from './services/ServiceSection';

const HeroBody1 = ({ services = [] }) => {
  return (
    <Box sx={{ backgroundColor: '#15191c' }} p={3} id="services">
      <Box sx={{ textAlign: "center" }} p={3} > 
        <motion.div
          variants={fadeIn('up', 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.7 }}>
          <Typography  variant="h3" p={1} color="white" sx={{ fontSize: '33px' }}>Our Services</Typography>
          <Typography variant="h6" color="#32b4de"  >Pixel-perfect compositing and animation solutions.</Typography>
        </motion.div>
      </Box>
      
      {services.length > 0 ? (
        services.map((service, index) => (
          <ServiceSection 
            key={service._id}
            title={service.title}
            description={service.description}
            image={service.image}
            icon={service.icon}
            index={index}
          />
        ))
      ) : (
         <Box textAlign="center" py={5}>
            <Typography color="gray">No services found. Please add them from the Admin Dashboard.</Typography>
         </Box>
      )}
    </Box>
  )
}

export default HeroBody1


