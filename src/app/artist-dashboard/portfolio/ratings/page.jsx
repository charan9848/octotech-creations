"use client";
import { 
  Box, 
  Typography, 
  Rating, 
  Button, 
  LinearProgress, 
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-hot-toast";
import { useNotifications } from "@/hooks/useNotifications";

export default function RatingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const notify = useNotifications();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [projectsData, setProjectsData] = useState({ projects: [] });
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
    recentReviews: []  });

  // Use ref to track if data has been loaded to prevent multiple fetches
  const dataLoadedRef = useRef(false);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/signin");
      return;
    }

    // Prevent multiple API calls using ref
    if (dataLoadedRef.current) return;

    fetchRatings();
    fetchProjects();
  }, [session?.user?.artistid, status]);

  // Reset data loaded flag when user logs out
  useEffect(() => {
    if (status === "unauthenticated") {
      dataLoadedRef.current = false;
    }
  }, [status]);
  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/portfolio/projects');
      if (response.ok) {
        const data = await response.json();
        setProjectsData(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchRatings = async () => {
    try {
      const response = await fetch('/api/portfolio/ratings');
      if (response.ok) {
        const data = await response.json();        // If we have ratings data from API, use it
        if (data.ratings && data.ratings.totalReviews > 0) {
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
            recentReviews: Array.isArray(data.ratings.reviews) ? data.ratings.reviews : []
          });        } else {
          // No real data exists yet - show empty state
          setRatingsData({
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
        }
      }
      
      // Mark data as loaded
      dataLoadedRef.current = true;
    } catch (error) {
      console.error('Error fetching ratings:', error);
      toast.error('Failed to load ratings data');
        // Use empty state as fallback
      setRatingsData({
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
      });    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewIndex) => {
    setDeleting(true);
    try {
      const response = await fetch('/api/feedback/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewIndex }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update ratings data with the response
        if (data.updatedRatings) {
          setRatingsData({
            currentRating: data.updatedRatings.currentRating || 0,
            totalReviews: data.updatedRatings.totalReviews || 0,
            ratingBreakdown: Array.isArray(data.updatedRatings.ratingBreakdown) ? data.updatedRatings.ratingBreakdown : [
              { stars: 5, count: 0, percentage: 0 },
              { stars: 4, count: 0, percentage: 0 },
              { stars: 3, count: 0, percentage: 0 },
              { stars: 2, count: 0, percentage: 0 },
              { stars: 1, count: 0, percentage: 0 }
            ],
            recentReviews: Array.isArray(data.updatedRatings.reviews) ? data.updatedRatings.reviews : []
          });        }
        // Use both toast and dashboard notification
        notify.actionComplete('delete_review', reviewToDelete?.review?.reviewer);
        
        // Add to dashboard notification center
        if (typeof window !== 'undefined' && window.addDashboardNotification) {
          window.addDashboardNotification(
            'success', 
            `Review from ${reviewToDelete?.review?.reviewer} deleted successfully!`,
            'delete_review',
            reviewToDelete?.review?.reviewer
          );
        }
        
        setDeleteDialogOpen(false);
        setReviewToDelete(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete review');
      }    } catch (error) {
      console.error('Error deleting review:', error);
      notify.error(error.message || 'Failed to delete review');
      
      // Add error notification to dashboard
      if (typeof window !== 'undefined' && window.addDashboardNotification) {
        window.addDashboardNotification(
          'error', 
          `Failed to delete review: ${error.message || 'Unknown error'}`,
          'delete_review_error'
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (reviewIndex, review) => {
    setReviewToDelete({ index: reviewIndex, review });
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
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
            flexDirection: { xs: 'column', lg: 'row' },
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
                </Typography>              </Box>
            ))}
          </Box>

          {/* Project Completion Stats */}
          <Box 
            sx={{ 
              flex: 1,
              backgroundColor: "#2a2e33", 
              borderRadius: 2,
              p: 4
            }}
          >
            <Typography variant="h6" sx={{ color: "#00a1e0", mb: 3 }}>
              Project Statistics
            </Typography>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h2" sx={{ color: "#4caf50", mb: 1 }}>
                {projectsData.projects ? projectsData.projects.filter(p => p.status === 'Completed').length : 0}
              </Typography>
              <Typography variant="body1" sx={{ color: "#ccc" }}>
                Completed Projects
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ color: "#ccc" }}>Total Projects:</Typography>
              <Typography sx={{ color: "#fff", fontWeight: 'bold' }}>
                {projectsData.projects ? projectsData.projects.length : 0}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ color: "#ccc" }}>In Progress:</Typography>
              <Typography sx={{ color: "#ff9800", fontWeight: 'bold' }}>
                {projectsData.projects ? projectsData.projects.filter(p => p.status === 'In Progress').length : 0}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ color: "#ccc" }}>Success Rate:</Typography>
              <Typography sx={{ color: "#4caf50", fontWeight: 'bold' }}>
                {projectsData.projects && projectsData.projects.length > 0 
                  ? Math.round((projectsData.projects.filter(p => p.status === 'Completed').length / projectsData.projects.length) * 100)
                  : 0}%
              </Typography>
            </Box>
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
          </Typography>          {Array.isArray(ratingsData.recentReviews) && ratingsData.recentReviews.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {ratingsData.recentReviews.map((review, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    backgroundColor: "#1a1e23", 
                    borderRadius: 2,
                    p: 3,
                    position: 'relative'
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ color: "#00a1e0" }}>
                      {review.reviewer}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ color: "#ccc" }}>
                        {new Date(review.date).toLocaleDateString()}
                      </Typography>
                      <IconButton
                        onClick={() => openDeleteDialog(index, review)}
                        size="small"
                        sx={{
                          color: "#f44336",
                          "&:hover": {
                            backgroundColor: "rgba(244, 67, 54, 0.1)",
                            color: "#ff6b6b"
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Rating
                      value={review.rating}
                      readOnly
                      size="small"
                      sx={{
                        "& .MuiRating-iconFilled": { color: "#FFD700" }
                      }}
                    />
                    <Chip
                      label={review.rating <= 2 ? "Negative Review" : review.rating === 3 ? "Neutral" : "Positive Review"}
                      size="small"
                      sx={{
                        backgroundColor: review.rating <= 2 ? "#f44336" : review.rating === 3 ? "#ff9800" : "#4caf50",
                        color: "white",
                        fontSize: "0.75rem"
                      }}
                    />
                  </Box>
                  <Typography variant="body1" sx={{ color: "#fff" }}>
                    "{review.comment}"
                  </Typography>
                  {review.projectTitle && (
                    <Typography variant="body2" sx={{ color: "#78838D", mt: 1, fontStyle: 'italic' }}>
                      Project: {review.projectTitle}
                    </Typography>
                  )}
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
          </Typography>          <Typography variant="body2" sx={{ color: "#ccc" }}>
            Your ratings are automatically calculated based on client reviews after project completion. 
            To improve your rating, focus on delivering high-quality work, meeting deadlines, and maintaining 
            excellent communication with clients. Ratings are updated in real-time as new reviews are submitted.
          </Typography>
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={closeDeleteDialog}
          PaperProps={{
            sx: {
              backgroundColor: "#1a1e23",
              color: "white"
            }
          }}
        >
          <DialogTitle sx={{ color: "#f44336", fontWeight: 600 }}>
            Delete Review
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete this review?
            </Typography>
            {reviewToDelete && (
              <Box sx={{ backgroundColor: "#2a2e33", borderRadius: 1, p: 2 }}>
                <Typography variant="body2" sx={{ color: "#00a1e0", mb: 1 }}>
                  <strong>Reviewer:</strong> {reviewToDelete.review.reviewer}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" sx={{ color: "#ccc" }}>
                    <strong>Rating:</strong>
                  </Typography>
                  <Rating
                    value={reviewToDelete.review.rating}
                    readOnly
                    size="small"
                    sx={{ "& .MuiRating-iconFilled": { color: "#FFD700" } }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: "#ccc" }}>
                  <strong>Comment:</strong> "{reviewToDelete.review.comment}"
                </Typography>
              </Box>
            )}
            <Typography variant="body2" sx={{ color: "#f44336", mt: 2 }}>
              <strong>Warning:</strong> This action cannot be undone and will recalculate your overall rating.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={closeDeleteDialog}
              sx={{ color: "#ccc" }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => reviewToDelete && handleDeleteReview(reviewToDelete.index)}
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
              sx={{
                backgroundColor: "#f44336",
                color: "white",
                "&:hover": { backgroundColor: "#d32f2f" },
                "&:disabled": { backgroundColor: "#666" }
              }}
            >
              {deleting ? "Deleting..." : "Delete Review"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
