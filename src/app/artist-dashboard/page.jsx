"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Box,
  Card,
  Typography, Avatar, IconButton, Button, Alert, CircularProgress,
} from "@mui/material";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'; 
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';


const ArtistDashboard = () => {
  const { data: session, status } = useSession();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || !session.user.artistid) {
      setError("Session missing artistid. Please log out and log back in.");
      setLoading(false);
      return;
    }

    const fetchArtist = async () => {
      try {
        const response = await fetch(`/api/artists/${session.user.artistid}`);
        if (!response.ok) {
          throw new Error("Failed to fetch artist");
        }
        const data = await response.json();
        setArtist(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [session, status]);
  const handleLogout = () => {
    signOut({ callbackUrl: "/artist-login" });
  };
  if (status === "loading" || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        {error.includes("Session missing artistid") && (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Your session was created before we added artist ID support. 
              Please log out and log back in to refresh your session.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleLogout}
              sx={{ mr: 2 }}
            >
              Log Out & Refresh Session
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  if (!artist) return <div>Artist not found.</div>;

  return (
    <Box>
      <Box display={"flex"} alignItems="center" justifyContent="space-between" >
        <Typography variant="h1" sx={{ fontSize: "30px" }} mb={2}>
          Dashboard Overview
        </Typography>
        <Typography variant="h2" sx={{ fontSize: "20px", color: "#78838D" }} mb={2}>
          Welcome, {artist.username || "Artist"}!
        </Typography>
      </Box>
      <Typography variant="h2">
        Welcome to your artist dashboard! Here you can manage your portfolio, profile, and more.
      </Typography>      <Box sx={{ mt: 4 }}>
        <Typography variant="h3" sx={{ fontSize: "24px", mb: 3, color: "white" }}>
          Profile Information
        </Typography>
        
        <Card
          variant="outlined"
          elevation={6}
          sx={{
            maxWidth: 600,
            backgroundColor: "#23272B",
            borderRadius: 3,
            border: "1px solid #2a2f33",
            position: "relative",
            overflow: "visible",
            "&:hover": {
              boxShadow: "0 8px 25px rgba(0,161,224,0.15)",
              transform: "translateY(-2px)",
              transition: "all 0.3s ease-in-out",
            },
          }}
        >
          {/* Header Section with Gradient */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #00a1e0 0%, #0077b5 100%)",
              height: 80,
              borderRadius: "12px 12px 0 0",
              position: "relative",
            }}
          />
          
          {/* Profile Content */}
          <Box sx={{ p: 3, pt: 1, position: "relative" }}>
            {/* Avatar positioned over gradient */}
            <Avatar
              src={artist.image}
              alt={artist.username}
              sx={{
                width: 100,
                height: 100,
                border: "4px solid #23272B",
                position: "absolute",
                top: -50,
                left: 24,
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            />
            
            {/* Action Buttons */}
            <Box 
              sx={{ 
                position: "absolute", 
                top: 16, 
                right: 16,
                display: "flex",
                gap: 1,
              }}
            >
              <Link href="/artist-dashboard/profile" passHref>
                <IconButton
                  sx={{
                    backgroundColor: "rgba(25, 118, 210, 0.1)",
                    border: "1px solid rgba(25, 118, 210, 0.3)",
                    "&:hover": {
                      backgroundColor: "rgba(25, 118, 210, 0.2)",
                      transform: "scale(1.05)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <EditOutlinedIcon sx={{ color: "#1976d2", fontSize: 20 }} />
                </IconButton>
              </Link>
              <IconButton
                sx={{
                  backgroundColor: "rgba(244, 67, 54, 0.1)",
                  border: "1px solid rgba(244, 67, 54, 0.3)",
                  "&:hover": {
                    backgroundColor: "rgba(244, 67, 54, 0.2)",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <DeleteOutlineOutlinedIcon sx={{ color: "#f44336", fontSize: 20 }} />
              </IconButton>
            </Box>
            
            {/* Profile Info */}
            <Box sx={{ ml: 14, mt: 2 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: "white", 
                  fontWeight: 600,
                  mb: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {artist.username}
                <Typography
                  component="span"
                  sx={{
                    fontSize: "10px",
                    color: "#78838D",
                    backgroundColor: "rgba(120, 131, 141, 0.1)",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    border: "1px solid rgba(120, 131, 141, 0.2)",
                  }}
                >
                  ID: {artist.artistid}
                </Typography>
              </Typography>
                <Typography 
                variant="body2" 
                sx={{ 
                  color: "#78838D", 
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                📧 {artist.email}
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
};

export default ArtistDashboard;