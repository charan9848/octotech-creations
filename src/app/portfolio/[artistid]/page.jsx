'use client';
import { Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { HeroSection } from '@/layout/portfolio-section/HeroSection';
import { SpecializationSection } from '@/layout/portfolio-section/SpecializationSection';
import { ExperienceSection } from '@/layout/portfolio-section/ExperienceSection';
import { ArtworkSection } from '@/layout/portfolio-section/ArtworkSection';
import { AwardsSection } from '@/layout/portfolio-section/AwardsSection';

const portfolio = () => {

    const { artistid } = useParams();
    const [portfolio, setPortfolio] = useState(null);
    const [artist, setArtist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch portfolio and artist data in parallel
                const [portfolioResponse, artistResponse] = await Promise.all([
                    axios.get(`/api/portfolio/${artistid}`),
                    axios.get(`/api/artists/${artistid}`)
                ]);

                setPortfolio(portfolioResponse.data);
                setArtist(artistResponse.data);
               
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (artistid) {
            fetchData();
        }
    }, [artistid]);

    if (loading) {
        return (
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                backgroundColor: "#15191c"
            }}>
                <CircularProgress sx={{ color: "#00a1e0" }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                backgroundColor: "#15191c",
                flexDirection: "column"
            }}>
                <Typography variant="h5" sx={{ color: "#ff4444", mb: 2 }}>
                    Error loading portfolio
                </Typography>
                <Typography variant="body1" sx={{ color: "#ccc" }}>
                    {error}
                </Typography>
            </Box>
        );
    }

    if (!portfolio && !artist) {
        return (
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                backgroundColor: "#15191c"
            }}>
                <Typography variant="h5" sx={{ color: "#ccc" }}>
                    Portfolio not found
                </Typography>
            </Box>
        );
    }

    // Prepare hero section data
    const heroData = {
        name: artist?.username || "Artist",
        bio: portfolio?.basicDetails?.bio || "",
        quotation: portfolio?.basicDetails?.quotation || "",
        email: portfolio?.basicDetails?.contactEmail || artist?.email || "",
        phone: portfolio?.basicDetails?.phone || "",
        logo: portfolio?.basicDetails?.portfolioImage || ""
    };

    return (
        <Box sx={{ backgroundColor: "#15191c", minHeight: "100vh" }}>
            {/* Hero Section */}
            <Box >
                <Box sx={{ mb: 0 }}>
                    <HeroSection {...heroData} />
                </Box>
                <Box sx={{ mb: 0 }}>
                    <SpecializationSection specialization={portfolio?.specialization} />
                </Box>                {portfolio?.experience && Array.isArray(portfolio.experience) && portfolio.experience.length > 0 && (
                    <Box sx={{ mb: 0 }}>
                        <ExperienceSection experience={portfolio.experience} />
                    </Box>
                )}                {portfolio?.artworks && Array.isArray(portfolio.artworks) && portfolio.artworks.length > 0 && (
                    <Box sx={{ backgroundColor: "black", borderRadius: 0, mb: 0 }}>
                        <ArtworkSection artworks={portfolio?.artworks} />
                    </Box>
                )}

                {portfolio?.awards && Array.isArray(portfolio.awards) && portfolio.awards.length > 0 && (
                    <Box sx={{ mb: 0 }}>
                        <AwardsSection awards={portfolio?.awards} />
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default portfolio;