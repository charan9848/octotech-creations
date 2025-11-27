"use client";

import { Box, Button, Typography, Grid, Container } from '@mui/material';
import React from 'react'
import InstagramIcon from '@mui/icons-material/Instagram';
import { motion } from 'framer-motion';
import { fadeIn } from "@/app/variants";
import Link from 'next/link';

const OurTeam = () => {


    const teams = [
        {
            id: 1,
            name: 'Raghu Roman',
            role: 'VFX Artist',
            image: 'https://res.cloudinary.com/djbilxr7i/image/upload/v1749808666/Raghu_npl96k.jpg',
            description: "With over 5 years of experience crafting visual effects exclusively for Tollywood films, Raghu Roman is not just a VFX artist — he's a cinematic sculptor. From invisible compositing to high-impact sequences, his work blends seamlessly into the director's vision, enhancing emotion, scale, and story. Raghu brings a deep understanding of film grammar, color tone, and shot psychology. His work isn't just about adding effects — it's about elevating narrative to the screen with clarity, precision, and cinematic depth.",
            instagram: "https://www.instagram.com/raghu__roman",
            portfolio: '/portfolio/Raghuroman123'

        },
        {
            id: 2,
            name: 'Akash Narayandas',
            role: 'Video Editor',
            image: 'https://res.cloudinary.com/djbilxr7i/image/upload/v1749808666/Akash_apamic.jpg',
            description: "With over 5 years of experience in video editing and motion graphics, Akash has helped brands, influencers, and creators transform basic footage into scroll-stopping, emotionally powerful content. His editing style is known for impact and clarity — every cut, transition, and motion graphic is designed to hold attention and drive growth. Want to see the craft up close? Dive deeper into his work on his dedicated channel: 📺 'Akash Edit Maestro' – where creativity meets mastery",
            instagram: 'https://www.instagram.com/akash_edit_maestro/',
            portfolio: '/portfolio/narayandasakash'
        }
        ,
        {
            id: 3,
            name: 'Tillu',
            role: '3D Artist',
            image: 'https://res.cloudinary.com/djbilxr7i/image/upload/v1748783457/artist-profiles/rg0efb1mrukfhcvyavpq.png',
            description: "Tillu is a 3D artist with a passion for creating stunning visual experiences. With expertise in modeling, texturing, and rendering, Tillu brings imagination to life through 3D art. Whether it's character design, environment creation, or product visualization, Tillu's work showcases a unique blend of creativity and technical skill.  Tillu's portfolio features a diverse range of projects, from realistic character models to intricate architectural visualizations. With a keen eye for detail and a commitment to quality, Tillu delivers exceptional 3D art that captivates audiences and enhances storytelling.",
            instagram: 'https://www.instagram.com/tilluanimator',
            portfolio: '/portfolio/tillu'
        }
    ]

    return (
        <Box position="relative" sx={{
            minHeight: "auto",
            backgroundColor: '#0B1113',
            overflow: 'hidden',
            py: 6
        }} id="ourteam">
            {/* Background Video */}
            <Box sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 0,
                opacity: 0.3
            }}>
                <video
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                    autoPlay
                    loop
                    muted
                    playsInline
                >
                    <source src="https://res.cloudinary.com/djbilxr7i/video/upload/v1763534144/background_video_gqq5pm.mp4" type="video/mp4" />
                </video>
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, #0B1113 0%, transparent 20%, transparent 80%, #0B1113 100%)'
                }} />
            </Box>

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                <Box textAlign="center" mb={5}>
                    <motion.div
                        variants={fadeIn('up', 0.1)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.4 }}>
                        <Typography variant="h3" className="text-shine" sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'Eurostile, sans-serif' }}>
                            OUR TEAM
                        </Typography>
                    </motion.div>
                    <motion.div
                        variants={fadeIn('up', 0.2)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.5 }}>
                        <Typography variant="body1" sx={{ color: '#aeb4b4', maxWidth: '700px', mx: 'auto', lineHeight: 1.6 }}>
                            Meet the creative minds behind our projects. A blend of artists, animators, and VFX specialists dedicated to bringing your vision to life.
                        </Typography>
                    </motion.div>
                </Box>

                <Box sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: 3,
                    py: 2,
                    px: { xs: 2, md: 4 },
                    scrollSnapType: 'x mandatory',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                    justifyContent: { xs: 'flex-start', md: 'center' }
                }}>
                    {teams.map((team, index) => (
                        <Box key={team.id} sx={{
                            minWidth: { xs: '300px', sm: '340px', md: '360px' },
                            scrollSnapAlign: 'center'
                        }}>
                            <motion.div
                                variants={fadeIn('up', 0.2 + (index * 0.1))}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, amount: 0.2 }}
                                style={{ height: '100%' }}
                            >
                                <Box sx={{
                                    height: '100%',
                                    background: '#13171a',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    p: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        background: '#1a1f23',
                                        border: '1px solid rgba(0, 172, 193, 0.3)',
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                                    }
                                }}>
                                    <Box sx={{ position: 'relative', mb: 2 }}>
                                        <Box
                                            component="img"
                                            src={team.image}
                                            alt={team.name}
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '3px solid rgba(0, 172, 193, 0.2)',
                                                padding: '3px'
                                            }}
                                        />
                                        <Box
                                            component="a"
                                            href={team.instagram}
                                            target="_blank"
                                            sx={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                background: '#E1306C',
                                                borderRadius: '50%',
                                                width: 30,
                                                height: 30,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                transition: 'transform 0.2s',
                                                '&:hover': { transform: 'scale(1.1)' }
                                            }}
                                        >
                                            <InstagramIcon sx={{ fontSize: 18 }} />
                                        </Box>
                                    </Box>

                                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5, fontFamily: 'Eurostile, sans-serif' }}>
                                        {team.name}
                                    </Typography>
                                    
                                    <Typography variant="subtitle2" sx={{ color: '#00ACC1', mb: 2, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase' }}>
                                        {team.role}
                                    </Typography>

                                    <Typography variant="body2" sx={{ 
                                        color: '#aeb4b4', 
                                        textAlign: 'center', 
                                        mb: 3, 
                                        lineHeight: 1.6, 
                                        flexGrow: 1, 
                                        fontSize: '0.9rem'
                                    }}>
                                        {team.description}
                                    </Typography>

                                    <Link href={team.portfolio} style={{ width: '100%', textDecoration: 'none' }}>
                                        <Button 
                                            fullWidth 
                                            variant="outlined" 
                                            size="small"
                                            sx={{ 
                                                color: '#00ACC1',
                                                borderColor: '#00ACC1',
                                                borderRadius: '8px',
                                                py: 1,
                                                textTransform: 'none',
                                                fontSize: '0.9rem',
                                                '&:hover': {
                                                    borderColor: '#00ACC1',
                                                    background: 'rgba(0, 172, 193, 0.1)'
                                                }
                                            }}
                                        >
                                            View Portfolio
                                        </Button>
                                    </Link>
                                </Box>
                            </motion.div>
                        </Box>
                    ))}
                </Box>
            </Container>
        </Box>
    )
}

export default OurTeam;