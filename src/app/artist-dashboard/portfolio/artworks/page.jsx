"use client";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton, 
  CardMedia,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  FormLabel
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { toast } from "react-hot-toast";
import { useNotifications } from "@/hooks/useNotifications";

// Validation Schema
const artworkSchema = Yup.object().shape({
  artworks: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required("Title is required"),
      description: Yup.string().required("Description is required"),
      date: Yup.date().required("Date is required"),
      image: Yup.string().url("Must be a valid URL").required("Image is required")
    })
  ).min(1, "At least one artwork is required")
});

// Image Upload Component
const ImageUpload = ({ onImageUpload, currentImage, artworkIndex }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }      const data = await response.json();
      onImageUpload(data.url);
      toast.success('Image uploaded successfully!');
      // Add notification to dashboard
      if (window.addDashboardNotification) {
        window.addDashboardNotification('success', 'Image uploaded successfully', 'image_upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  return (
    <Box>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id={`image-upload-${artworkIndex}`}
      />
      
      <Box
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        sx={{
          border: `2px dashed ${dragActive ? '#007bb5' : '#00a1e0'}`,
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: dragActive ? 'rgba(0, 161, 224, 0.1)' : '#2a2e33',
          transition: 'all 0.3s ease',
          mb: 2
        }}
        onClick={() => document.getElementById(`image-upload-${artworkIndex}`).click()}
      >
        {uploading ? (
          <CircularProgress size={40} sx={{ color: '#00a1e0' }} />
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 48, color: '#00a1e0', mb: 1 }} />
            <Typography variant="body1" sx={{ color: '#fff', mb: 1 }}>
              {dragActive ? 'Drop image here' : 'Click to upload or drag and drop'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#ccc' }}>
              PNG, JPG, GIF up to 5MB
            </Typography>
          </>
        )}
      </Box>

      {currentImage && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ color: "#00a1e0", mb: 1 }}>
            Current Image:
          </Typography>          <Box sx={{ maxWidth: 300, backgroundColor: "#1a1e23", borderRadius: 2, overflow: 'hidden' }}>
            <CardMedia
              component="img"
              height="200"
              image={currentImage}
              alt="Artwork preview"
              sx={{ objectFit: 'cover' }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default function ArtworksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const notify = useNotifications();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialData, setInitialData] = useState({
    artworks: [{ title: "", image: "", description: "", date: "" }]
  });  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Use ref to track if data has been loaded to prevent multiple fetches
  const dataLoadedRef = useRef(false);  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/signin");
      return;
    }

    // Prevent multiple API calls using ref
    if (dataLoadedRef.current) return;

    fetchArtworks();
  }, [session?.user?.artistid, status]);

  // Reset data loaded flag when user logs out
  useEffect(() => {
    if (status === "unauthenticated") {
      dataLoadedRef.current = false;
    }
  }, [status]);
  
  const fetchArtworks = async () => {
    try {
      const response = await fetch('/api/portfolio/artworks');
      if (response.ok) {
        const data = await response.json();
        if (data.artworks && data.artworks.length > 0) {
          // Ensure all required fields have default values
          const normalizedArtworks = data.artworks.map(artwork => ({
            title: artwork.title || "",
            image: artwork.image || "",
            description: artwork.description || "",
            date: artwork.date || ""
          }));
          setInitialData({ artworks: normalizedArtworks });
        } else {
          // Ensure we have at least one artwork with proper defaults
          setInitialData({
            artworks: [{ title: "", image: "", description: "", date: "" }]
          });
        }
      } else {
        // Fallback to default structure
        setInitialData({
          artworks: [{ title: "", image: "", description: "", date: "" }]
        });
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
      toast.error('Failed to load artworks data');
      // Ensure we still have a valid structure
      setInitialData({
        artworks: [{ title: "", image: "", description: "", date: "" }]
      });    } finally {
      setLoading(false);
      setDataLoaded(true);
      
      // Mark data as loaded
      dataLoadedRef.current = true;
    }
  };
  const handleSubmit = async (values) => {
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/portfolio/artworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        notify.actionComplete('artwork_upload', `${values.artworks.length} artworks`);
        // Add notification to dashboard
        if (window.addDashboardNotification) {
          window.addDashboardNotification('success', `Successfully saved ${values.artworks.length} artworks`, 'artwork_save');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save artworks');
      }
    } catch (error) {
      console.error('Error saving artworks:', error);
      notify.error(error.message || 'Failed to save artworks');
      // Add error notification to dashboard
      if (window.addDashboardNotification) {
        window.addDashboardNotification('error', 'Failed to save artworks', 'artwork_save_error');
      }
    } finally {
      setSubmitting(false);
    }
  };if (status === "loading" || loading || !dataLoaded) {
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

  if (!session) {
    return null;
  }
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
        <Typography variant="h4" sx={{ color: "#fff", mb: 1 }}>
          Artworks
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#78838D", mb: 4, fontSize: "14px" }}
        >
          Showcase your best artworks. Upload images, add descriptions, and creation dates.
          Artist ID: <strong>{session?.user?.artistid}</strong>
        </Typography>
        
        <Box sx={{ backgroundColor: "#23272b", borderRadius: 2, p: { xs: 3, sm: 4 } }}>
          <Formik
          initialValues={initialData}
          validationSchema={artworkSchema}
          enableReinitialize={true}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue }) => (
            <Form>
              <FieldArray name="artworks">
                {({ push, remove }) => (
                  <>
                    {values.artworks && values.artworks.map((artwork, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          mb: 3, 
                          backgroundColor: "#2a2e33", 
                          borderRadius: 2,
                          p: 3,
                          border: '1px solid #333'
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                          <Typography variant="h6" sx={{ color: "#00a1e0" }}>
                            Artwork {index + 1}
                          </Typography>
                          {values.artworks.length > 1 && (
                            <IconButton
                              onClick={() => remove(index)}
                              sx={{ color: "#ff4444" }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                            <Box sx={{ flex: { md: '1 1 50%' }, width: { xs: '100%' } }}>
                              <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Title *</FormLabel>
                              <Field
                                as={TextField}
                                name={`artworks.${index}.title`}
                                value={artwork?.title || ""}
                                placeholder="Enter artwork title"
                                fullWidth
                                size="small"
                                error={touched.artworks?.[index]?.title && errors.artworks?.[index]?.title}
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
                              {touched.artworks?.[index]?.title && errors.artworks?.[index]?.title && (
                                <Typography variant="caption" sx={{ color: "#ff4444", mt: 1, display: 'block' }}>
                                  {errors.artworks[index].title}
                                </Typography>
                              )}
                            </Box>
                            
                            <Box sx={{ flex: { md: '1 1 50%' }, width: { xs: '100%' } }}>
                              <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Date *</FormLabel>
                              <Field
                                as={TextField}
                                name={`artworks.${index}.date`}
                                value={artwork?.date || ""}
                                type="date"
                                fullWidth
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                error={touched.artworks?.[index]?.date && errors.artworks?.[index]?.date}
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
                              {touched.artworks?.[index]?.date && errors.artworks?.[index]?.date && (
                                <Typography variant="caption" sx={{ color: "#ff4444", mt: 1, display: 'block' }}>
                                  {errors.artworks[index].date}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          
                          <Box>
                            <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Artwork Image *</FormLabel>
                            <ImageUpload
                              onImageUpload={(url) => setFieldValue(`artworks.${index}.image`, url)}
                              currentImage={artwork?.image || ""}
                              artworkIndex={index}
                            />
                            {touched.artworks?.[index]?.image && errors.artworks?.[index]?.image && (
                              <Typography variant="caption" sx={{ color: "#ff4444", mt: 1, display: 'block' }}>
                                {errors.artworks[index].image}
                              </Typography>
                            )}
                          </Box>
                          
                          <Box>
                            <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Description *</FormLabel>
                            <Field
                              as={TextField}
                              name={`artworks.${index}.description`}
                              value={artwork?.description || ""}
                              placeholder="Describe your artwork, inspiration, and techniques used..."
                              fullWidth
                              multiline
                              rows={3}
                              size="small"
                              error={touched.artworks?.[index]?.description && errors.artworks?.[index]?.description}
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
                            {touched.artworks?.[index]?.description && errors.artworks?.[index]?.description && (
                              <Typography variant="caption" sx={{ color: "#ff4444", mt: 1, display: 'block' }}>
                                {errors.artworks[index].description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                    
                    <Box sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 3 }}>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => push({ title: "", image: "", description: "", date: "" })}
                        sx={{
                          borderColor: "#00a1e0",
                          color: "#00a1e0",
                          minWidth: { xs: '100%', sm: 'auto' },
                          "&:hover": {
                            borderColor: "#007bb5",
                            backgroundColor: "rgba(0, 161, 224, 0.1)"
                          }
                        }}
                      >
                        Add Artwork
                      </Button>
                      
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                        startIcon={submitting ? <CircularProgress size={20} /> : null}
                        sx={{
                          backgroundColor: "#00a1e0",
                          "&:hover": { backgroundColor: "#007bb5" },
                          color: "#fff",
                          minWidth: { xs: '100%', sm: 'auto' },
                          px: 4
                        }}
                      >
                        {submitting ? 'Saving...' : 'Save Artworks'}
                      </Button>
                    </Box>
                  </>
                )}
              </FieldArray>
            </Form>
          )}
        </Formik>
        </Box>
      </Box>
    </Box>
  );
}
