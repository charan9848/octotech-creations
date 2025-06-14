"use client";
import { Avatar, Box, Card, CardHeader, Typography, Button } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { red } from '@mui/material/colors';

const Reviews = () => {
    const [testinomals, setTestinomals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [displayCount, setDisplayCount] = useState(6); // Show 6 reviews initially
    const [showAll, setShowAll] = useState(false);    useEffect(() => {
        const fetchTestinomals = async () => {
            try {
                // Limit to show recent reviews first, sorted by date
                const response = await axios.get('/api/feedback?sortBy=submittedAt&sortOrder=desc&limit=50');

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

    const handleShowMore = () => {
        if (showAll) {
            setDisplayCount(6);
            setShowAll(false);
        } else {
            setDisplayCount(testinomals.length);
            setShowAll(true);
        }
    };

    // Get the reviews to display
    const reviewsToShow = testinomals.slice(0, displayCount);


    return (
        <Box sx={{ backgroundColor: '#15191C' }} p={5}>
            <Box m={5} sx={{ display: "flex", flexDirection: 'column', justifyContent: "center", alignItems: "center" }}>
                <Box textAlign="center" >
                    <Typography variant='h1' color='white'>What Our Clients Say</Typography>
                    <Typography variant="h6" color="#32b4de" my={2}>
                        We value our clients' feedback and strive to exceed their expectations. Here are some of the reviews from our satisfied customers.
                    </Typography>
                </Box>                <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2, mt: 4 }}>                    {loading ? (
                        <Typography variant="body1" color="white">Loading testimonials...</Typography>
                    ) : reviewsToShow.length > 0 ? (
                        reviewsToShow.map((testimonial, index) => (                            <Card key={testimonial._id || `testimonial-${index}`} sx={{
                                width: "auto",
                                backgroundColor: '#1a1e23',
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


                                <Box m={2}>
                                    {[...Array(5)].map((_, index) => (
                                        <span key={index} style={{ color: index < testimonial.rating ? '#FFD700' : '#ccc' }}>★</span>
                                    ))}
                                </Box>

                                <Box sx={{ px: 2 }}>
                                    <Typography variant="body1" sx={{ color: '#b0b0b0' }}>
                                        "{testimonial.review}"
                                    </Typography>
                                </Box>

                                <CardHeader
                                    avatar={
                                        <Avatar aria-label={testimonial.clientName} alt={testimonial.clientName} />

                                    }
                                    title={
                                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                            {testimonial.clientName}
                                        </Typography>
                                    }
                                    subheader={
                                        <Typography variant="subtitle1" sx={{ color: '#b0b0b0' }}>
                                            {new Date(testimonial.submittedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </Typography>
                                    }

                                />


                            </Card>                        ))
                    ) : (
                        <Typography variant="body1" color="white">No testimonials available yet.</Typography>
                    )}
                </Box>

                {/* Show More/Less Button */}
                {testinomals.length > 6 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Button
                            variant="outlined"
                            onClick={handleShowMore}
                            sx={{
                                color: '#32b4de',
                                borderColor: '#32b4de',
                                '&:hover': {
                                    borderColor: '#ffffff',
                                    backgroundColor: 'rgba(50, 180, 222, 0.1)',
                                },
                                px: 4,
                                py: 1.5
                            }}
                        >
                            {showAll ? `Show Less` : `Show More (${testinomals.length - displayCount} more)`}
                        </Button>
                    </Box>
                )}

            </Box>
        </Box>
    )
}

export default Reviews;