"use client";

import { Box, Button, Typography, Grid, Container, Avatar } from '@mui/material';
import React, { useState, useEffect } from 'react'
import InstagramIcon from '@mui/icons-material/Instagram';
import { motion } from 'framer-motion';
import { fadeIn } from "@/app/variants";
import Link from 'next/link';

const OurTeam = () => {
    const [sectionContent, setSectionContent] = useState({
        title: 'OUR TEAM',
        subtitle: 'Meet the creative minds behind our projects. A blend of artists, animators, and VFX specialists dedicated to bringing your vision to life.',
        backgroundVideoUrl: '',
        hiddenArtists: []
    });

    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get initials from name
    const getInitials = (name) => {
        if (!name) return '?';
        const words = name.trim().split(' ');
        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    };

    // Generate a consistent color based on name
    const stringToColor = (string) => {
        if (!string) return '#00ACC1';
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = ['#00ACC1', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#009688', '#4CAF50', '#FF9800', '#FF5722'];
        return colors[Math.abs(hash) % colors.length];
    };

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Fetch section content (title, subtitle, background video, hidden artists)
                let hiddenArtists = [];
                const contentRes = await fetch('/api/admin/site-content');
                if (contentRes.ok) {
                    const data = await contentRes.json();
                    if (data.ourTeam) {
                        setSectionContent(prev => ({ ...prev, ...data.ourTeam }));
                        hiddenArtists = data.ourTeam.hiddenArtists || [];
                    }
                }

                // Fetch artists from the team API
                const teamRes = await fetch('/api/team');
                if (teamRes.ok) {
                    const artists = await teamRes.json();
                    if (artists && artists.length > 0) {
                        // Filter out hidden artists and transform data
                        const visibleArtists = artists.filter(artist => !hiddenArtists.includes(artist.artistid));
                        const teamData = visibleArtists.map((artist, index) => ({
                            id: index + 1,
                            artistid: artist.artistid,
                            name: artist.username,
                            role: artist.role || 'Artist',
                            image: artist.profileImage || artist.image || '',
                            description: artist.bio || '',
                            instagram: artist.instagram || '',
                            portfolio: `/portfolio/${artist.artistid}`
                        }));
                        setTeams(teamData);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch our team content", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    // Don't render if no team members
    if (!loading && teams.length === 0) {
        return null;
    }

    return (
        <Box position="relative" sx={{
            minHeight: "auto",
            backgroundColor: '#0B1113',
            overflow: 'hidden',
            py: 6
        }} id="ourteam">
            {/* Background Video */}
            {sectionContent.backgroundVideoUrl && (
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
                    key={sectionContent.backgroundVideoUrl}
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
                    <source src={sectionContent.backgroundVideoUrl} type="video/mp4" />
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
            )}

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                <Box textAlign="center" mb={5}>
                    <motion.div
                        variants={fadeIn('up', 0.1)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.4 }}>
                        <Typography variant="h3" className="text-shine" sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'Eurostile, sans-serif' }}>
                            {sectionContent.title}
                        </Typography>
                    </motion.div>
                    <motion.div
                        variants={fadeIn('up', 0.2)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.5 }}>
                        <Typography variant="body1" sx={{ color: '#aeb4b4', maxWidth: '700px', mx: 'auto', lineHeight: 1.6 }}>
                            {sectionContent.subtitle}
                        </Typography>
                    </motion.div>
                </Box>

                <Box sx={{
                    display: 'flex',
                    flexWrap: { xs: 'nowrap', md: 'wrap' },
                    overflowX: { xs: 'auto', md: 'visible' },
                    gap: 3,
                    py: 2,
                    px: { xs: 2, md: 0 },
                    scrollSnapType: { xs: 'x mandatory', md: 'none' },
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                    justifyContent: 'center'
                }}>
                    {teams.map((team, index) => (
                        <Box key={team.id} sx={{
                            width: { xs: '300px', sm: '340px', md: '360px' },
                            minWidth: { xs: '300px', sm: '340px', md: '360px' },
                            maxWidth: { xs: '300px', sm: '340px', md: '360px' },
                            flexShrink: 0,
                            scrollSnapAlign: { xs: 'center', md: 'none' }
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
                                        <Avatar
                                            src={team.image}
                                            alt={team.name}
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                fontSize: '2.5rem',
                                                fontWeight: 'bold',
                                                bgcolor: stringToColor(team.name),
                                                border: '3px solid rgba(0, 172, 193, 0.3)',
                                                boxShadow: '0 0 0 3px rgba(0, 172, 193, 0.1)'
                                            }}
                                        >
                                            {getInitials(team.name)}
                                        </Avatar>
                                        {team.instagram && (
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
                                        )}
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