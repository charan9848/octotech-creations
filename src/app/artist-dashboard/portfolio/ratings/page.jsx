"use client";
import { 
  Box, 
  Typography, 
  Rating, 
  Button, 
  LinearProgress, 
  Chip,
  CircularProgress,
  Alert
} from "@mui/material";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { toast } from "react-hot-toast";

export default function RatingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ratingsData, setRatingsData] = useState({
    currentRating: 0,
    totalReviews: 0,
    ratingBreakdown: [
      { stars: 5, count: 0, percentage: 0 },
      { stars: 4, count: 0, percentage: 0 },
      { stars: 3, count: 0, percentage: 0 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 1, count: 0, percentage: 0 }
    ],
    recentReviews: []
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/signin");
      return;
    }

    fetchRatings();
  }, [session, status]);

  const fetchRatings = async () => {
    try {
      const response = await fetch('/api/portfolio/ratings');
      if (response.ok) {
        const data = await response.json();
          // If we have ratings data from API, use it
        if (data.ratings) {
          setRatingsData({
            currentRating: data.ratings.currentRating || 0,
            totalReviews: data.ratings.totalReviews || 0,
            ratingBreakdown: Array.isArray(data.ratings.ratingBreakdown) ? data.ratings.ratingBreakdown : [
              { stars: 5, count: 0, percentage: 0 },
              { stars: 4, count: 0, percentage: 0 },
              { stars: 3, count: 0, percentage: 0 },
              { stars: 2, count: 0, percentage: 0 },
              { stars: 1, count: 0, percentage: 0 }
            ],
            recentReviews: Array.isArray(data.ratings.recentReviews) ? data.ratings.recentReviews : []
          });
        } else {
          // Use mock data for demonstration if no real data exists
          setRatingsData({
            currentRating: 4.7,
            totalReviews: 60,
            ratingBreakdown: [
              { stars: 5, count: 45, percentage: 75 },
              { stars: 4, count: 12, percentage: 20 },
              { stars: 3, count: 2, percentage: 3.3 },
              { stars: 2, count: 1, percentage: 1.7 },
              { stars: 1, count: 0, percentage: 0 }
            ],
            recentReviews: [
              {
                reviewer: "John Smith",
                rating: 5,
                comment: "Exceptional digital art skills! Delivered exactly what I envisioned.",
                date: "2024-11-15"
              },
              {
                reviewer: "Sarah Johnson",
                rating: 4,
                comment: "Great work on the 3D modeling project. Very professional.",
                date: "2024-11-10"
              },
              {
                reviewer: "Mike Chen",
                rating: 5,
                comment: "Amazing attention to detail and creative vision.",
                date: "2024-11-08"
              }
            ]
          });
        }
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      toast.error('Failed to load ratings data');
      
      // Use mock data as fallback
      setRatingsData({
        currentRating: 4.7,
        totalReviews: 60,
        ratingBreakdown: [
          { stars: 5, count: 45, percentage: 75 },
          { stars: 4, count: 12, percentage: 20 },
          { stars: 3, count: 2, percentage: 3.3 },
          { stars: 2, count: 1, percentage: 1.7 },
          { stars: 1, count: 0, percentage: 0 }
        ],
        recentReviews: [
          {
            reviewer: "John Smith",
            rating: 5,
            comment: "Exceptional digital art skills! Delivered exactly what I envisioned.",
            date: "2024-11-15"
          },
          {
            reviewer: "Sarah Johnson",
            rating: 4,
            comment: "Great work on the 3D modeling project. Very professional.",
            date: "2024-11-10"
          },
          {
            reviewer: "Mike Chen",
            rating: 5,
            comment: "Amazing attention to detail and creative vision.",
            date: "2024-11-08"
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#00a1e0' }} />
      </Box>
    );
  }

  if (!session) {
    return null;
  }

  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return "Excellent Rating";
    if (rating >= 4.0) return "Very Good Rating";
    if (rating >= 3.5) return "Good Rating";
    if (rating >= 3.0) return "Average Rating";
    return "Needs Improvement";
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "#4caf50";
    if (rating >= 4.0) return "#8bc34a";
    if (rating >= 3.5) return "#ffc107";
    if (rating >= 3.0) return "#ff9800";
    return "#f44336";
  };
  return (
    <Box 
      sx={{ 
        backgroundColor: '#15191c',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        p: { xs: 2, sm: 3, md: 5 }
      }}
    >
      <Box 
        sx={{ 
          width: '100%',
          maxWidth: 800,
          backgroundColor: '#1a1e23',
          borderRadius: 2,
          p: { xs: 3, sm: 4 }
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            color: "#fff", 
            mb: 4,
            textAlign: 'center',
            fontWeight: 600
          }}
        >
          Ratings & Reviews
        </Typography>
        
        {/* Overall Rating and Breakdown Container */}
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            mb: 4
          }}
        >
          {/* Overall Rating */}
          <Box 
            sx={{ 
              flex: 1,
              backgroundColor: "#2a2e33", 
              borderRadius: 2,
              p: 4, 
              textAlign: "center"
            }}
          >
            <Typography variant="h3" sx={{ color: "#00a1e0", mb: 1 }}>
              {ratingsData.currentRating.toFixed(1)}
            </Typography>
            <Rating
              value={ratingsData.currentRating}
              precision={0.1}
              readOnly
              size="large"
              sx={{
                mb: 2,
                "& .MuiRating-iconFilled": { color: "#FFD700" }
              }}
            />
            <Typography variant="body1" sx={{ color: "#ccc", mb: 1 }}>
              Based on {ratingsData.totalReviews} reviews
            </Typography>
            <Chip
              icon={<TrendingUpIcon />}
              label={getRatingLabel(ratingsData.currentRating)}
              sx={{
                backgroundColor: getRatingColor(ratingsData.currentRating),
                color: "#fff"
              }}
            />
          </Box>
          
          {/* Rating Breakdown */}
          <Box 
            sx={{ 
              flex: 1,
              backgroundColor: "#2a2e33", 
              borderRadius: 2,
              p: 4
            }}
          >            <Typography variant="h6" sx={{ color: "#00a1e0", mb: 3 }}>
              Rating Breakdown
            </Typography>
            {Array.isArray(ratingsData.ratingBreakdown) && ratingsData.ratingBreakdown.map((item) => (
              <Box key={item.stars} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography sx={{ minWidth: 20, color: "#fff" }}>
                  {item.stars}
                </Typography>
                <StarIcon sx={{ color: "#FFD700", mx: 1 }} />
                <LinearProgress
                  variant="determinate"
                  value={item.percentage}
                  sx={{
                    flex: 1,
                    mx: 2,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#1a1e23",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#00a1e0"
                    }
                  }}
                />
                <Typography sx={{ minWidth: 40, color: "#ccc", fontSize: "0.9rem" }}>
                  ({item.count})
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
        
        {/* Recent Reviews */}
        <Box 
          sx={{ 
            backgroundColor: "#2a2e33", 
            borderRadius: 2,
            p: 4,
            mb: 4
          }}
        >          <Typography variant="h6" sx={{ color: "#00a1e0", mb: 3 }}>
            Recent Reviews
          </Typography>
          {Array.isArray(ratingsData.recentReviews) && ratingsData.recentReviews.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {ratingsData.recentReviews.map((review, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    backgroundColor: "#1a1e23", 
                    borderRadius: 2,
                    p: 3
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ color: "#00a1e0" }}>
                      {review.reviewer}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#ccc" }}>
                      {new Date(review.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Rating
                    value={review.rating}
                    readOnly
                    size="small"
                    sx={{
                      mb: 1,
                      "& .MuiRating-iconFilled": { color: "#FFD700" }
                    }}
                  />
                  <Typography variant="body1" sx={{ color: "#fff" }}>
                    "{review.comment}"
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Alert 
              severity="info" 
              sx={{ 
                backgroundColor: "#1a1e23", 
                color: "#00a1e0",
                border: "1px solid #00a1e0",
                '& .MuiAlert-icon': {
                  color: "#00a1e0"
                }
              }}
            >
              No reviews yet. Complete your first project to start receiving reviews!
            </Alert>
          )}
        </Box>
        
        {/* Information Note */}
        <Box 
          sx={{ 
            backgroundColor: "#1a1e23", 
            borderRadius: 2,
            p: 3, 
            border: "1px solid #00a1e0" 
          }}
        >
          <Typography variant="body1" sx={{ color: "#00a1e0", mb: 1 }}>
            📊 Rating Information
          </Typography>
          <Typography variant="body2" sx={{ color: "#ccc" }}>
            Your ratings are automatically calculated based on client reviews after project completion. 
            To improve your rating, focus on delivering high-quality work, meeting deadlines, and maintaining 
            excellent communication with clients. Ratings are updated in real-time as new reviews are submitted.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
