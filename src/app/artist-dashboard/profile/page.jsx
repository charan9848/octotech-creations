"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useFormik } from "formik";
import { 
  Box, 
  Button, 
  CircularProgress, 
  FormHelperText, 
  FormLabel, 
  TextField, 
  Typography, 
  Alert,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Paper
} from "@mui/material";
import { CloudUpload, PhotoCamera } from "@mui/icons-material";
import * as yup from "yup";
import { toast } from "react-hot-toast";

const Profile = () => {
  const { data: session, status } = useSession();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Validation schema
  const validationSchema = yup.object({
    username: yup.string().required('Username is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    image: yup.string().url('Invalid URL').required('Image URL is required')
  });
  // Fetch artist by ID from session
  useEffect(() => {
    const fetchArtist = async () => {
      if (session?.user?.artistid) {
        try {
          const res = await axios.get(`/api/artists/${session.user.artistid}`);
          setArtist(res.data);
          setError("");
        } catch (err) {
          setError("Failed to fetch artist data");
          setArtist(null);
        }
        setLoading(false);
      } else if (status !== "loading") {
        setError("No artist ID found in session");
        setLoading(false);
      }
    };    fetchArtist();
  }, [session, status]);

  // Handle image upload to Cloudinary
  const handleImageUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.url) {
        formik.setFieldValue('image', response.data.url);
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      handleImageUpload(file);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };  // Formik setup
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: artist?.username || "",
      email: artist?.email || "",
      image: artist?.image || ""
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setSaving(true);
      setMessage("");
      setError("");
      try {
        const response = await axios.put(`/api/artists/${session.user.artistid}`, values);
        setMessage("Profile updated successfully!");
        toast.success("Profile updated!");
        // Re-fetch updated artist
        const res = await axios.get(`/api/artists/${session.user.artistid}`);
        setArtist(res.data);
      } catch (err) {
        console.error("Profile update error:", err);
        const errorMessage = err.response?.data?.error || "Failed to update profile";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setSaving(false);
      }
    }
  });
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!session) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
        <Alert severity="warning">Please sign in to access your profile.</Alert>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  if (!artist) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
        <Alert severity="info">Artist not found.</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: '#15191c',
        minHeight: '100vh',
        display: "flex",
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        flexDirection: { xs: "column", sm: "column", md: "row" },
        p: 3
      }}
    >
      {/* Profile Form */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          maxWidth: 500,
        }}
      >
        <Card
          sx={{
            backgroundColor: '#23272b',
            color: 'white',
            borderRadius: '8px',
            border: '1px solid #333'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" color="white" mb={1}>
              Edit Profile
            </Typography>
            <Typography
              variant="body2"
              color="#78838D"
              mb={3}
              fontSize="14px"
            >
              Update your profile information below.
            </Typography>

            {message && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <FormLabel sx={{ color: 'white' }}>Username *</FormLabel>
              <TextField
                name="username"
                type="text"
                placeholder="Enter your username"
                fullWidth
                size="small"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.username && Boolean(formik.errors.username)}
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#15191c',
                    color: 'white',
                    '& fieldset': {
                      borderColor: '#333',
                    },
                    '&:hover fieldset': {
                      borderColor: '#555',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#78838D',
                  },
                }}
              />
              <FormHelperText sx={{ minHeight: "20px", color: '#f44336' }}>
                {formik.touched.username && formik.errors.username}
              </FormHelperText>

              <FormLabel sx={{ color: 'white' }}>Email *</FormLabel>
              <TextField
                name="email"
                type="email"
                placeholder="Enter your email"
                fullWidth
                size="small"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#15191c',
                    color: 'white',
                    '& fieldset': {
                      borderColor: '#333',
                    },
                    '&:hover fieldset': {
                      borderColor: '#555',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#78838D',
                  },
                }}
              />
              <FormHelperText sx={{ minHeight: "20px", color: '#f44336' }}>
                {formik.touched.email && formik.errors.email}
              </FormHelperText>              <FormLabel sx={{ color: 'white' }}>Profile Image URL *</FormLabel>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  name="image"
                  type="url"
                  placeholder="Enter image URL or upload a file"
                  fullWidth
                  size="small"
                  value={formik.values.image}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.image && Boolean(formik.errors.image)}
                  sx={{
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#15191c',
                      color: 'white',
                      '& fieldset': {
                        borderColor: '#333',
                      },
                      '&:hover fieldset': {
                        borderColor: '#555',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: '#78838D',
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={uploading ? <CircularProgress size={16} /> : <CloudUpload />}
                  onClick={triggerFileInput}
                  disabled={uploading}
                  sx={{
                    mb: 1,
                    minWidth: 'auto',
                    px: 2,
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    '&:hover': {
                      borderColor: '#1565c0',
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    },
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </Box>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <FormHelperText sx={{ minHeight: "20px", color: '#f44336' }}>
                {formik.touched.image && formik.errors.image}
              </FormHelperText>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!formik.isValid || saving}
                startIcon={
                  saving ? <CircularProgress size={20} color="inherit" /> : null
                }
                sx={{ mt: 2 }}
              >
                {saving ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>

      {/* Profile Preview */}
      <Box 
        sx={{ 
          width: { xs: '100%', md: '40%' }, 
          mt: { xs: 3, md: 0 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Card
          sx={{
            backgroundColor: '#23272b',
            color: 'white',
            borderRadius: '8px',
            border: '1px solid #333',
            width: '100%',
            maxWidth: 400
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>            <Typography variant="h5" color="white" mb={3}>
              Profile Preview
            </Typography>
            
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar
                src={formik.values.image || artist.image}
                alt="Profile"
                sx={{
                  width: 120,
                  height: 120,
                  border: '3px solid #1976d2'
                }}
              />
              <IconButton
                onClick={triggerFileInput}
                disabled={uploading}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: '#1976d2',
                  color: 'white',
                  width: 36,
                  height: 36,
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  },
                  '&:disabled': {
                    backgroundColor: '#666',
                  },
                }}
              >
                {uploading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <PhotoCamera sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </Box>
            
            <Typography variant="h6" color="white" mb={1}>
              {formik.values.username || artist.username}
            </Typography>
            
            <Typography variant="body2" color="#78838D" mb={1}>
              {formik.values.email || artist.email}
            </Typography>
            
            <Typography variant="caption" color="#78838D">
              Artist ID: {session.user.artistid}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Profile;