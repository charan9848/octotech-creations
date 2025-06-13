"use client";
import { Box, Typography, Button, CircularProgress, FormHelperText, FormLabel, TextField, Paper, Input } from "@mui/material";
import { CloudUpload, Image as ImageIcon } from "@mui/icons-material";
import { useFormik } from "formik";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import { useNotifications } from "@/hooks/useNotifications";
import axios from "axios";

export default function BasicDetailsPage() {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");  const { data: session, status } = useSession();
  const router = useRouter();
  const notify = useNotifications();
  
  // Use ref to track if data has been loaded to prevent multiple fetches
  const dataLoadedRef = useRef(false);
  const validationSchema = useMemo(() => yup.object({
    bio: yup.string().required('Bio is required').min(10, 'Bio should be at least 10 characters'),
    quotation: yup.string().required('Quotation is required'),
    contactEmail: yup.string().email('Invalid email').required('Contact email is required'),
    phone: yup.string().required('Phone number is required'),
    location: yup.string().required('Location is required'),
    portfolioImage: yup.string().required('Portfolio image is required')
  }), []);const formik = useFormik({
    initialValues: {
      bio: "",
      quotation: "",
      portfolioImage: "",
      contactEmail: "",
      phone: "",
      location: ""
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await axios.post('/api/portfolio/basic-details', values);
        toast.success("Basic details saved successfully!");
        notify.actionComplete('basic_details_save', 'basic information');
        
        // Add notification to dashboard
        if (window.addDashboardNotification) {
          window.addDashboardNotification('success', 'Basic details saved successfully', 'basic_details_save');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.error || "Failed to save basic details";
        toast.error(errorMessage);
        notify.error(errorMessage);
        // Add error notification to dashboard
        if (window.addDashboardNotification) {
          window.addDashboardNotification('error', 'Failed to save basic details', 'basic_details_error');
        }
      } finally {
        setLoading(false);
      }
    }
  });
  const handleImageUpload = async (file) => {
    if (!file) return;

    setUploadLoading(true);
    try {
      // Delete old image if it exists and is from our upload service
      const currentImage = formik.values.portfolioImage;
      if (currentImage && currentImage.trim() && currentImage.includes('cloudinary')) {
        try {
          await axios.delete(`/api/upload?url=${encodeURIComponent(currentImage)}`);
          console.log('Old portfolio image deleted successfully');
        } catch (deleteError) {
          console.warn('Failed to delete old portfolio image:', deleteError);
          // Continue with upload even if delete fails
        }
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = response.data.url;
      formik.setFieldValue('portfolioImage', imageUrl);
      setPreviewUrl(imageUrl);
      toast.success("Image uploaded successfully!");
      notify.actionComplete('image_upload', 'portfolio image');
      // Add notification to dashboard
      if (window.addDashboardNotification) {
        window.addDashboardNotification('success', 'Portfolio image uploaded successfully', 'image_upload');
      }
    } catch (error) {
      toast.error("Failed to upload image");
      notify.error("Failed to upload image");
      console.error("Upload error:", error);
      // Add error notification to dashboard
      if (window.addDashboardNotification) {
        window.addDashboardNotification('error', 'Failed to upload portfolio image', 'image_upload_error');
      }
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Upload immediately
      handleImageUpload(file);
    }
  };  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/artist-login");
      return;
    }

    // Prevent multiple API calls using ref
    if (dataLoadedRef.current) return;

    // Fetch existing portfolio data
    const fetchPortfolioData = async () => {
      try {
        const response = await axios.get('/api/portfolio/basic-details');
        const { basicDetails } = response.data;
        formik.setValues({
          bio: basicDetails.bio || "",
          quotation: basicDetails.quotation || "",
          portfolioImage: basicDetails.portfolioImage || "",
          contactEmail: basicDetails.contactEmail || "",
          phone: basicDetails.phone || "",
          location: basicDetails.location || ""
        });
        
        // Set preview URL if image exists
        if (basicDetails.portfolioImage) {
          setPreviewUrl(basicDetails.portfolioImage);
        }
        
        // Mark data as loaded
        dataLoadedRef.current = true;
      } catch (error) {
        console.error("Failed to fetch portfolio data:", error);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchPortfolioData();
  }, [session?.user?.artistid, status]);

  // Reset data loaded flag when session changes (user logs out/in)
  useEffect(() => {
    if (status === "unauthenticated") {
      dataLoadedRef.current = false;
    }
  }, [status]);

  // Cleanup effect for object URLs
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (status === "loading" || fetchLoading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "400px",
        backgroundColor: "#15191c" 
      }}>
        <CircularProgress sx={{ color: "#00a1e0" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: '#15191c',
        minHeight: '100vh',
        p: 3
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" sx={{ color: "#fff", mb: 1 }}>
          Basic Details
        </Typography>        <Typography
          variant="body2"
          sx={{ color: "#78838D", mb: 4, fontSize: "14px" }}
        >
          Please fill in your basic information to create your artist portfolio.
          Artist ID: <strong>{session?.user?.artistid}</strong>
        </Typography>

        <Paper sx={{ p: 4, backgroundColor: "#23272b", borderRadius: 2 }}>
          <form onSubmit={formik.handleSubmit}>
            {/* Bio Field */}
            <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Bio *</FormLabel>
            <TextField
              name="bio"
              multiline
              rows={4}
              placeholder="Tell us about yourself, your artistic journey, and your expertise..."
              fullWidth
              size="small"
              value={formik.values.bio}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.bio && Boolean(formik.errors.bio)}
              sx={{
                mb: 1,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#1a1e23",
                  color: "#fff",
                  "& fieldset": { borderColor: "#333" },
                  "&:hover fieldset": { borderColor: "#00a1e0" },
                  "&.Mui-focused fieldset": { borderColor: "#00a1e0" }
                }
              }}
            />
            <FormHelperText sx={{ minHeight: "20px", color: "#ff4444" }}>
              {formik.touched.bio && formik.errors.bio}
            </FormHelperText>

            {/* Quotation Field */}
            <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Quotation *</FormLabel>
            <TextField
              name="quotation"
              placeholder="Your favorite quote or artistic motto..."
              fullWidth
              size="small"
              value={formik.values.quotation}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.quotation && Boolean(formik.errors.quotation)}
              sx={{
                mb: 1,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#1a1e23",
                  color: "#fff",
                  "& fieldset": { borderColor: "#333" },
                  "&:hover fieldset": { borderColor: "#00a1e0" },
                  "&.Mui-focused fieldset": { borderColor: "#00a1e0" }
                }
              }}
            />
            <FormHelperText sx={{ minHeight: "20px", color: "#ff4444" }}>
              {formik.touched.quotation && formik.errors.quotation}
            </FormHelperText>

            {/* Contact Email Field */}
            <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Contact Email *</FormLabel>
            <TextField
              name="contactEmail"
              type="email"
              placeholder="your.email@example.com"
              fullWidth
              size="small"
              value={formik.values.contactEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.contactEmail && Boolean(formik.errors.contactEmail)}
              sx={{
                mb: 1,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#1a1e23",
                  color: "#fff",
                  "& fieldset": { borderColor: "#333" },
                  "&:hover fieldset": { borderColor: "#00a1e0" },
                  "&.Mui-focused fieldset": { borderColor: "#00a1e0" }
                }
              }}
            />
            <FormHelperText sx={{ minHeight: "20px", color: "#ff4444" }}>
              {formik.touched.contactEmail && formik.errors.contactEmail}
            </FormHelperText>

            {/* Phone Field */}
            <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Phone *</FormLabel>
            <TextField
              name="phone"
              placeholder="+1 (555) 123-4567"
              fullWidth
              size="small"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              sx={{
                mb: 1,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#1a1e23",
                  color: "#fff",
                  "& fieldset": { borderColor: "#333" },
                  "&:hover fieldset": { borderColor: "#00a1e0" },
                  "&.Mui-focused fieldset": { borderColor: "#00a1e0" }
                }
              }}
            />
            <FormHelperText sx={{ minHeight: "20px", color: "#ff4444" }}>
              {formik.touched.phone && formik.errors.phone}
            </FormHelperText>

            {/* Location Field */}
            <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Location *</FormLabel>
            <TextField
              name="location"
              placeholder="City, Country"
              fullWidth
              size="small"
              value={formik.values.location}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.location && Boolean(formik.errors.location)}
              sx={{
                mb: 1,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#1a1e23",
                  color: "#fff",
                  "& fieldset": { borderColor: "#333" },
                  "&:hover fieldset": { borderColor: "#00a1e0" },
                  "&.Mui-focused fieldset": { borderColor: "#00a1e0" }
                }
              }}
            />
            <FormHelperText sx={{ minHeight: "20px", color: "#ff4444" }}>
              {formik.touched.location && formik.errors.location}
            </FormHelperText>            {/* Portfolio Image Upload Field */}
            <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Portfolio Image *</FormLabel>
            
            {/* File Upload Area */}
            <Box
              sx={{
                border: "2px dashed #333",
                borderRadius: "8px",
                p: 3,
                textAlign: "center",
                backgroundColor: "#1a1e23",
                mb: 1,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#00a1e0",
                  backgroundColor: "#1e2329"
                }
              }}
              onClick={() => document.getElementById('portfolio-image-input').click()}
            >
              <Input
                id="portfolio-image-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                sx={{ display: 'none' }}
              />
              
              {uploadLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <CircularProgress size={24} sx={{ color: "#00a1e0" }} />
                  <Typography sx={{ color: "#00a1e0" }}>Uploading...</Typography>
                </Box>
              ) : (
                <Box>
                  <CloudUpload sx={{ fontSize: 48, color: "#666", mb: 1 }} />
                  <Typography variant="body1" sx={{ color: "#fff", mb: 1 }}>
                    Click to upload portfolio image
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Supports: JPG, PNG, GIF (Max 5MB)
                  </Typography>
                </Box>
              )}
            </Box>
            
            <FormHelperText sx={{ minHeight: "20px", color: "#ff4444" }}>
              {formik.touched.portfolioImage && formik.errors.portfolioImage}
            </FormHelperText>

            {/* Image Preview */}
            {previewUrl && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: "#00a1e0", mb: 1 }}>
                  Portfolio Image Preview:
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-block',
                    borderRadius: "8px",
                    overflow: 'hidden',
                    border: "2px solid #00a1e0"
                  }}
                >
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Portfolio Preview"
                    sx={{
                      width: "300px",
                      height: "200px",
                      objectFit: "cover",
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      borderRadius: '50%',
                      p: 1
                    }}
                  >
                    <ImageIcon sx={{ color: '#00a1e0', fontSize: 20 }} />
                  </Box>
                </Box>
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!formik.isValid || loading}
              startIcon={
                loading ? <CircularProgress size={20} color="inherit" /> : null
              }
              sx={{
                mt: 2,
                backgroundColor: "#00a1e0",
                "&:hover": { backgroundColor: "#007bb5" },
                "&:disabled": { backgroundColor: "#333" }
              }}
            >
              {loading ? "Saving..." : "Save Basic Details"}
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}
