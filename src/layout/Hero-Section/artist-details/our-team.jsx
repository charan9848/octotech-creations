"use client";

import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, IconButton, Typography } from '@mui/material';
import React from 'react'
import { red } from '@mui/material/colors';
import InstagramIcon from '@mui/icons-material/Instagram';
import { motion } from 'framer-motion';
import { fadeIn } from "@/app/variants";

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
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            padding: "10px",
            backgroundColor: '#15191c'
        }} id="ourteam">
            {/* Background Video */}
            <video
                className="video-background"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    opacity: 0.6
                }}
                preload="auto"
                autoPlay
                loop
                muted
                disablePictureInPicture
                controlsList="nodownload nofullscreen noremoteplayback"
                playsInline
            >
                <source src="https://res.cloudinary.com/djbilxr7i/video/upload/v1763534144/background_video_gqq5pm.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Content */}
            <Box sx={{
                position: 'relative',
                zIndex: 2,
                display: "flex",
                flexDirection: 'column',
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                my: 4,
                padding: 3,
            }}>
                <Box textAlign="center" >
                    <motion.div
                        variants={fadeIn('up', 0.1)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.4 }}>
                        <Typography variant="h1" color="white">Our Team</Typography>
                    </motion.div>
                    <motion.div
                        variants={fadeIn('up', 0.2)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.5 }}>
                        <Typography variant="h6" color="#32b4de" my={2}>
                            Meet the creative minds behind our projects. Our team is a blend of artists, animators, and VFX specialists dedicated to bringing your vision to life.
                        </Typography>
                    </motion.div>
                </Box>

                <motion.div
                    variants={fadeIn('up', 0.1)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.4 }}>
                    <Box my={3} sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: { md: 'space-between', sm: 'center', xs: 'center' }, gap: 8, }}>
                        {
                            teams.map(team => (                                <Card key={team.id} sx={{
                                    width: 380,
                                    backgroundColor: 'transparent',
                                    backdropFilter: 'blur(100px)',
                                    color: 'white',
                                    borderRadius: 5,
                                    border: '2px solid #333',
                                    boxShadow: '0 4px 8px rgba(0,0,0,1)',
                                    transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',

                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                                    },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '500'
                                }}>
                                    <CardHeader
                                        avatar={
                                            <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                                                <img src={team.image} alt={team.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                            </Avatar>
                                        }
                                        title={
                                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                                {team.name}
                                            </Typography>
                                        }
                                        subheader={
                                            <Typography variant="subtitle1" sx={{ color: '#b0b0b0' }}>
                                                {team.role}
                                            </Typography>
                                        }
                                        action={
                                            <IconButton aria-label="instagram" href={team.instagram} target="_blank">
                                                <InstagramIcon sx={{ color: '#e1306c' }} />
                                            </IconButton>
                                        }
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                                            {team.description}
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: 'center', p: 2, marginTop: 'auto' }} >
                                        <Button variant='text' href={team.portfolio}>
                                            <Typography variant="button" sx={{ color: '#32b4de', textDecoration: 'none' }}>
                                                View Portfolio
                                            </Typography>
                                        </Button>

                                    </CardActions>
                                </Card>

                            ))
                        }
                    </Box>
                </motion.div>
            </Box>
        </Box>
    )
}

export default OurTeam;