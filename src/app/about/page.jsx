'use client';

import { motion } from 'framer-motion';
import { fadeIn } from '@/app/variants';
import { Box, Typography, CircularProgress } from "@mui/material";
import { useState, useEffect } from 'react';

const About = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch('/api/team');
        if (res.ok) {
          const data = await res.json();
          setTeamMembers(data);
        }
      } catch (error) {
        console.error("Failed to fetch team members", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

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
              <Typography variant="h1" color="white">
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
              <Typography variant="h2" color="#aeb4b4" paragraph>
                At Octotech Creations, we turn that vision into visuals that sell, connect, and stay etched in the viewer’s mind. With over 5 years of experience, we’ve helped brands grow, products stand out, and emotions come alive — not just with edits, but with impact.
              </Typography>
              <Typography variant="h2" color="#aeb4b4" paragraph>
                From cinematic VFX in Tollywood films to 3D ads that replace expensive shoots, from scroll-stopping reels to real estate videos that lead to real bookings, we’ve done one thing consistently: create visuals that drive results.
              </Typography>
              <Typography variant="h2" color="#aeb4b4" paragraph>
                Our clients don’t chase trends — they build trust, and we help them do it with visuals that feel real, purposeful, and powerful. If your goal is to rise above the noise, make people pause, feel, and act — we’re already on the same page.
              </Typography>
              <Typography variant="h2" color="#aeb4b4">
                This isn’t just editing. This is Octotech Creations — where your story becomes unforgettable.
              </Typography>
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

        <Box mt={10} mb={5}>
        <motion.div
          variants={fadeIn('up', 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.7 }}
        >
          <Typography variant="h1" color="white" textAlign="center" mb={6}>
            Meet The Team
          </Typography>
        </motion.div>
        
        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress sx={{ color: '#32b4de' }} />
          </Box>
        ) : (
          <Box className="marquee-container">
            <Box className="marquee-content">
              {[...teamMembers, ...teamMembers].map((member, index) => (
                <Box
                  key={index}
                  sx={{
                    width: '280px',
                    backgroundColor: '#15191c',
                    p: 4,
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '1px solid #333',
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      borderColor: '#00ACC1',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  <Typography variant="h4" className="text-shine" sx={{ fontSize: '24px !important', mb: 1, WebkitTextStroke: '0px' }}>
                    {member.username}
                  </Typography>
                  <Typography variant="body1" color="#aeb4b4">
                    {member.role === 'admin' ? 'Administrator' : 'Team Member'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default About;