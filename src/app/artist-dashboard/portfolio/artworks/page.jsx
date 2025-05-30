"use client";
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  IconButton, 
  Card, 
  CardContent, 
  CardMedia,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle
} from "@mui/material";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { toast } from "react-hot-toast";

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
      }

      const data = await response.json();
      onImageUpload(data.url);
      toast.success('Image uploaded successfully!');
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
          </Typography>
          <Card sx={{ maxWidth: 300, backgroundColor: "#1a1e23" }}>
            <CardMedia
              component="img"
              height="200"
              image={currentImage}
              alt="Artwork preview"
              sx={{ objectFit: 'cover' }}
            />
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default function ArtworksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialData, setInitialData] = useState({
    artworks: [{ title: "", image: "", description: "", date: "" }]
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/signin");
      return;
    }

    fetchArtworks();
  }, [session, status]);

  const fetchArtworks = async () => {
    try {
      const response = await fetch('/api/portfolio/artworks');
      if (response.ok) {
        const data = await response.json();
        if (data.artworks && data.artworks.length > 0) {
          setInitialData({ artworks: data.artworks });
        }
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
      toast.error('Failed to load artworks data');
    } finally {
      setLoading(false);
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
        toast.success('Artworks saved successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save artworks');
      }
    } catch (error) {
      console.error('Error saving artworks:', error);
      toast.error(error.message || 'Failed to save artworks');
    } finally {
      setSubmitting(false);
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ color: "#fff", mb: 3 }}>
        Artworks
      </Typography>
      
      <Paper sx={{ p: 4, backgroundColor: "#23272b", color: "#fff" }}>
        <Typography variant="body1" sx={{ color: "#ccc", mb: 3 }}>
          Showcase your best artworks. Upload images, add descriptions, and creation dates.
        </Typography>
        
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
                    {values.artworks.map((artwork, index) => (
                      <Card key={index} sx={{ mb: 3, backgroundColor: "#2a2e33", color: "#fff" }}>
                        <CardContent>
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
                          
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Field
                                as={TextField}
                                name={`artworks.${index}.title`}
                                label="Title"
                                fullWidth
                                error={touched.artworks?.[index]?.title && errors.artworks?.[index]?.title}
                                helperText={touched.artworks?.[index]?.title && errors.artworks?.[index]?.title}
                                sx={{
                                  "& .MuiInputLabel-root": { color: "#00a1e0" },
                                  "& .MuiOutlinedInput-root": {
                                    color: "#fff",
                                    "& fieldset": { borderColor: "#00a1e0" },
                                    "&:hover fieldset": { borderColor: "#007bb5" }
                                  }
                                }}
                              />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Field
                                as={TextField}
                                name={`artworks.${index}.date`}
                                label="Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                error={touched.artworks?.[index]?.date && errors.artworks?.[index]?.date}
                                helperText={touched.artworks?.[index]?.date && errors.artworks?.[index]?.date}
                                sx={{
                                  "& .MuiInputLabel-root": { color: "#00a1e0" },
                                  "& .MuiOutlinedInput-root": {
                                    color: "#fff",
                                    "& fieldset": { borderColor: "#00a1e0" },
                                    "&:hover fieldset": { borderColor: "#007bb5" }
                                  }
                                }}
                              />
                            </Grid>
                            
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" sx={{ color: "#00a1e0", mb: 2 }}>
                                Artwork Image
                              </Typography>
                              <ImageUpload
                                onImageUpload={(url) => setFieldValue(`artworks.${index}.image`, url)}
                                currentImage={artwork.image}
                                artworkIndex={index}
                              />
                              {touched.artworks?.[index]?.image && errors.artworks?.[index]?.image && (
                                <Typography variant="caption" sx={{ color: "#ff4444", mt: 1, display: 'block' }}>
                                  {errors.artworks[index].image}
                                </Typography>
                              )}
                            </Grid>
                            
                            <Grid item xs={12}>
                              <Field
                                as={TextField}
                                name={`artworks.${index}.description`}
                                label="Description"
                                fullWidth
                                multiline
                                rows={3}
                                error={touched.artworks?.[index]?.description && errors.artworks?.[index]?.description}
                                helperText={touched.artworks?.[index]?.description && errors.artworks?.[index]?.description}
                                sx={{
                                  "& .MuiInputLabel-root": { color: "#00a1e0" },
                                  "& .MuiOutlinedInput-root": {
                                    color: "#fff",
                                    "& fieldset": { borderColor: "#00a1e0" },
                                    "&:hover fieldset": { borderColor: "#007bb5" }
                                  }
                                }}
                              />
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => push({ title: "", image: "", description: "", date: "" })}
                        sx={{
                          borderColor: "#00a1e0",
                          color: "#00a1e0",
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
      </Paper>
    </Box>
  );
}
