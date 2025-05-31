"use client";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Rating, 
  Card,
  CardContent,
  CircularProgress,
  Alert,
  FormLabel,
  Chip
} from "@mui/material";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import StarIcon from "@mui/icons-material/Star";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { toast } from "react-hot-toast";

export default function ClientFeedbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [artistData, setArtistData] = useState(null);
  const [projectTitle, setProjectTitle] = useState("");
  
  const [feedbackData, setFeedbackData] = useState({
    clientName: "",
    clientEmail: "",
    rating: 0,
    comment: "",
    projectTitle: "",
    artistId: params.artistId
  });

  useEffect(() => {
    if (params.artistId) {
      fetchArtistData();
      const project = searchParams.get('project');
      if (project) {
        setProjectTitle(decodeURIComponent(project));
        setFeedbackData(prev => ({ ...prev, projectTitle: decodeURIComponent(project) }));
      }
    }
  }, [params.artistId, searchParams]);

  const fetchArtistData = async () => {
    try {
      const response = await fetch(`/api/artists/${params.artistId}`);
      if (response.ok) {
        const data = await response.json();
        setArtistData(data);
      } else {
        toast.error('Artist not found');
      }
    } catch (error) {
      console.error('Error fetching artist:', error);
      toast.error('Failed to load artist information');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedbackData.clientName || !feedbackData.clientEmail || !feedbackData.rating || !feedbackData.comment) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!feedbackData.rating || feedbackData.rating < 1 || feedbackData.rating > 5) {
      toast.error('Please select a rating between 1 and 5 stars');
      return;
    }

    setSubmitting(true);
    
    try {
      const submissionData = {
        artistId: params.artistId,
        projectTitle: feedbackData.projectTitle || projectTitle,
        rating: feedbackData.rating,
        review: feedbackData.comment,
        clientName: feedbackData.clientName,
        clientEmail: feedbackData.clientEmail
      };

      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success('Thank you for your feedback!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFeedbackData(prev => ({ ...prev, [field]: value }));
  };
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

  if (!artistData) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        backgroundColor: "#15191c" 
      }}>
        <Alert 
          severity="error"
          sx={{
            backgroundColor: "#1a1e23",
            color: "white",
            '& .MuiAlert-icon': {
              color: "#f44336"
            }
          }}
        >
          Artist not found. Please check the link and try again.
        </Alert>
      </Box>
    );
  }if (submitted) {
    return (
      <Box 
        sx={{ 
          backgroundColor: '#15191c',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: { xs: 2, sm: 3 }
        }}
      >
        <Box 
          sx={{ 
            maxWidth: 600, 
            width: '100%',
            backgroundColor: '#1a1e23',
            borderRadius: 2,
            p: 4,
            textAlign: 'center'
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 80, mb: 3, color: "#4caf50" }} />
          <Typography variant="h4" sx={{ mb: 2, color: "white", fontWeight: 600 }}>
            Thank You!
          </Typography>
          <Typography variant="body1" sx={{ color: "#78838D", mb: 4 }}>
            Your feedback has been successfully submitted. The artist will be notified 
            of your review and it will help them improve their services.
          </Typography>
          
          <Box sx={{ mb: 4, textAlign: 'left' }}>
            <Typography variant="body2" sx={{ mb: 1, color: "#78838D" }}>
              ✅ The artist has been notified of your review
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: "#78838D" }}>
              📊 Your rating will help improve their services
            </Typography>
            <Typography variant="body2" sx={{ color: "#78838D" }}>
              🤝 Thank you for helping our creative community grow
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            onClick={() => window.close()}
            sx={{
              backgroundColor: "#00a1e0",
              "&:hover": { backgroundColor: "#007bb5" }
            }}
          >
            Close Window
          </Button>
        </Box>
      </Box>
    );
  }  return (
    <Box 
      sx={{ 
        backgroundColor: '#15191c',
        display: "flex",
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: { xs: "column", sm: "column", md: "row" },
        minHeight: '100vh',
        p: 5
      }}
    >
      {/* Left side - Form */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          maxWidth: 600,
          p: 4
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: "white", mb: 1, fontWeight: 600 }}>
            Project Feedback
          </Typography>
          <Typography variant="body2" sx={{ color: "#78838D", fontSize: "14px" }}>
            Please share your experience working with {artistData.username}
          </Typography>
          {projectTitle && (
            <Chip 
              label={`Project: ${projectTitle}`}
              sx={{ 
                backgroundColor: "#00a1e0", 
                color: "white",
                fontWeight: 'bold',
                mt: 2
              }}
            />
          )}
        </Box>

        {/* Artist Info */}
        <Box 
          sx={{ 
            backgroundColor: "#1a1e23", 
            borderRadius: 2, 
            p: 3, 
            mb: 4,
            textAlign: 'center'
          }}
        >
          {artistData.image && (
            <img 
              src={artistData.image} 
              alt={artistData.username}
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: 16,
                border: '3px solid #00a1e0'
              }}
            />
          )}
          <Typography variant="h6" sx={{ color: "white", mb: 1 }}>
            {artistData.username}
          </Typography>
          <Typography variant="body2" sx={{ color: "#78838D" }}>
            Artist ID: {artistData.artistid}
          </Typography>
        </Box>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Client Information */}
            <Box>
              <FormLabel sx={{ color: "white", mb: 1, display: 'block' }}>
                Your Name *
              </FormLabel>
              <TextField
                fullWidth
                size="small"
                value={feedbackData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                placeholder="Enter your full name"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1a1e23',
                    '& fieldset': {
                      borderColor: '#333',
                    },
                    '&:hover fieldset': {
                      borderColor: '#00a1e0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00a1e0',
                    },
                    '& input': {
                      color: 'white',
                    }
                  }
                }}
              />
            </Box>

            <Box>
              <FormLabel sx={{ color: "white", mb: 1, display: 'block' }}>
                Your Email *
              </FormLabel>
              <TextField
                fullWidth
                size="small"
                type="email"
                value={feedbackData.clientEmail}
                onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                placeholder="Enter your email address"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1a1e23',
                    '& fieldset': {
                      borderColor: '#333',
                    },
                    '&:hover fieldset': {
                      borderColor: '#00a1e0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00a1e0',
                    },
                    '& input': {
                      color: 'white',
                    }
                  }
                }}
              />
            </Box>

            {/* Rating */}
            <Box>
              <FormLabel sx={{ color: "white", mb: 2, display: 'block' }}>
                Overall Rating *
              </FormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Rating
                  value={feedbackData.rating}
                  onChange={(event, newValue) => handleInputChange('rating', newValue)}
                  size="large"
                  sx={{
                    "& .MuiRating-iconFilled": { color: "#FFD700" },
                    "& .MuiRating-iconHover": { color: "#FFD700" }
                  }}
                />
                <Typography variant="body1" sx={{ color: "#78838D", ml: 1 }}>
                  {feedbackData.rating === 0 && "Select a rating"}
                  {feedbackData.rating === 1 && "Poor"}
                  {feedbackData.rating === 2 && "Fair"}
                  {feedbackData.rating === 3 && "Good"}
                  {feedbackData.rating === 4 && "Very Good"}
                  {feedbackData.rating === 5 && "Excellent"}
                </Typography>
              </Box>
            </Box>

            {/* Comment */}
            <Box>
              <FormLabel sx={{ color: "white", mb: 1, display: 'block' }}>
                Your Review *
              </FormLabel>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={feedbackData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                placeholder="Please share your experience working with this artist. What did you like? How was the communication? Was the project delivered on time?"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1a1e23',
                    '& fieldset': {
                      borderColor: '#333',
                    },
                    '&:hover fieldset': {
                      borderColor: '#00a1e0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00a1e0',
                    },
                    '& textarea': {
                      color: 'white',
                    }
                  }
                }}
              />
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
              startIcon={
                submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />
              }
              sx={{
                mt: 2,
                py: 1.5,
                backgroundColor: "#00a1e0",
                "&:hover": { backgroundColor: "#007bb5" },
                "&:disabled": { backgroundColor: "#ccc" }
              }}
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </Box>
        </form>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid #333' }}>
          <Typography variant="body2" sx={{ color: "#78838D" }}>
            Your feedback helps artists improve their services and helps other clients make informed decisions.
          </Typography>
        </Box>
      </Box>

      {/* Right side - Image */}
      <Box sx={{ width: "40%", display: { xs: "none", md: 'flex' }, mt: 6 }}>
        <Box
          component="img"
          src="https://www.actionvfx.com/img/home/artist.jpg"
          alt="Artist Feedback"
          sx={{
            width: "100%",
            height: "auto",
            borderRadius: "8px",
          }}
        />
      </Box>
    </Box>
  );
}
