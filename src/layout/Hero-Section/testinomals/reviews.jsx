"use client";
import { Avatar, Box, Card, Typography, Container } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion';
import { fadeIn } from "@/app/variants";
import StarIcon from '@mui/icons-material/Star';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const Reviews = () => {
    const [testinomals, setTestinomals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestinomals = async () => {
            try {
                // Limit to 15 recent reviews to ensure smooth performance
                const response = await axios.get('/api/feedback?sortBy=submittedAt&sortOrder=desc&limit=15');
                if (response.data.success && response.data.data) {
                    setTestinomals(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching testinomals:", error);
                setTestinomals([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTestinomals();
    }, []);

    // Duplicate items for seamless marquee (4 sets to ensure seamless loop with -50% transform)
    const marqueeItems = testinomals.length > 0 ? [...testinomals, ...testinomals, ...testinomals, ...testinomals] : [];

    return (
        <Box sx={{ backgroundColor: '#0B1113', py: { xs: 6, md: 10 }, overflow: 'hidden' }}>
            <Container maxWidth="xl">
                <Box textAlign="center" mb={{ xs: 5, md: 8 }}>
                    <motion.div
                        variants={fadeIn('up', 0.1)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.4 }}>
                        <Typography variant='h2' className="text-shine" sx={{ 
                            fontFamily: 'Eurostile, sans-serif', 
                            fontWeight: 'bold', 
                            mb: 2,
                            fontSize: { xs: '2.5rem', md: '3.75rem' }
                        }}>
                            CLIENT REVIEWS
                        </Typography>
                    </motion.div>
                    <motion.div
                        variants={fadeIn('up', 0.2)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.5 }}>
                        <Typography variant="h6" sx={{ color: '#aeb4b4', maxWidth: '800px', mx: 'auto', lineHeight: 1.6 }}>
                            We value our clients' feedback and strive to exceed their expectations. Here are some of the reviews from our satisfied customers.
                        </Typography>
                    </motion.div>
                </Box>

                {loading ? (
                    <Typography variant="body1" color="white" textAlign="center">Loading testimonials...</Typography>
                ) : testinomals.length > 0 ? (
                    <Box className="marquee-container">
                        <Box className="marquee-content" sx={{ willChange: 'transform' }}>
                            {marqueeItems.map((testimonial, index) => (
                                <Box
                                    key={`${testimonial._id}-${index}`}
                                    sx={{
                                        minWidth: { xs: '300px', md: '400px' },
                                        maxWidth: { xs: '300px', md: '400px' },
                                        backgroundColor: '#13171a',
                                        borderRadius: '20px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        p: { xs: 3, md: 4 },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            border: '1px solid rgba(0, 172, 193, 0.5)',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                            backgroundColor: '#1a1f23'
                                        }
                                    }}
                                >
                                    <FormatQuoteIcon sx={{ 
                                        fontSize: 60, 
                                        color: 'rgba(0, 172, 193, 0.1)', 
                                        position: 'absolute', 
                                        top: 20, 
                                        right: 20 
                                    }} />

                                    <Box sx={{ display: 'flex', gap: 0.5, mb: 3 }}>
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon 
                                                key={i} 
                                                sx={{ 
                                                    color: i < testimonial.rating ? '#FFD700' : '#333',
                                                    fontSize: 20
                                                }} 
                                            />
                                        ))}
                                    </Box>

                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            color: '#e0e0e0', 
                                            mb: 4, 
                                            lineHeight: 1.8,
                                            flexGrow: 1,
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        "{testimonial.review}"
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
                                        <Avatar 
                                            sx={{ 
                                                bgcolor: '#00ACC1',
                                                width: 48,
                                                height: 48,
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {testimonial.clientName.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" sx={{ color: 'white', fontFamily: 'Eurostile, sans-serif', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                {testimonial.clientName}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#888' }}>
                                                {new Date(testimonial.submittedAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                ) : (
                    <Typography variant="body1" color="white" textAlign="center">No testimonials available yet.</Typography>
                )}
            </Container>
        </Box>
    )
}

export default Reviews;
