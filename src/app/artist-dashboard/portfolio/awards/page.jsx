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
  CircularProgress,
  Alert
} from "@mui/material";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { toast } from "react-hot-toast";

// Validation Schema
const awardsSchema = Yup.object().shape({
  awards: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required("Award title is required"),
      year: Yup.string()
        .matches(/^\d{4}$/, "Year must be a 4-digit number")
        .required("Year is required"),
      organization: Yup.string().required("Organization is required"),
      description: Yup.string().required("Description is required")
    })
  ).min(1, "At least one award is required")
});

export default function AwardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialData, setInitialData] = useState({
    awards: [{ title: "", year: "", description: "", organization: "" }]
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/signin");
      return;
    }

    fetchAwards();
  }, [session, status]);

  const fetchAwards = async () => {
    try {
      const response = await fetch('/api/portfolio/awards');
      if (response.ok) {
        const data = await response.json();
        if (data.awards && data.awards.length > 0) {
          setInitialData({ awards: data.awards });
        }
      }
    } catch (error) {
      console.error('Error fetching awards:', error);
      toast.error('Failed to load awards data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/portfolio/awards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success('Awards saved successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save awards');
      }
    } catch (error) {
      console.error('Error saving awards:', error);
      toast.error(error.message || 'Failed to save awards');
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
        Awards & Recognition
      </Typography>
      
      <Paper sx={{ p: 4, backgroundColor: "#23272b", color: "#fff" }}>
        <Typography variant="body1" sx={{ color: "#ccc", mb: 3 }}>
          Showcase your achievements, awards, and recognitions in the art industry.
        </Typography>
        
        <Formik
          initialValues={initialData}
          validationSchema={awardsSchema}
          enableReinitialize={true}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched }) => (
            <Form>
              <FieldArray name="awards">
                {({ push, remove }) => (
                  <>
                    {values.awards.map((award, index) => (
                      <Card key={index} sx={{ mb: 3, backgroundColor: "#2a2e33", color: "#fff" }}>
                        <CardContent>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <EmojiEventsIcon sx={{ color: "#FFD700" }} />
                              <Typography variant="h6" sx={{ color: "#00a1e0" }}>
                                Award {index + 1}
                              </Typography>
                            </Box>
                            {values.awards.length > 1 && (
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
                                name={`awards.${index}.title`}
                                label="Award Title"
                                placeholder="e.g., Best Digital Art 2024"
                                fullWidth
                                error={touched.awards?.[index]?.title && errors.awards?.[index]?.title}
                                helperText={touched.awards?.[index]?.title && errors.awards?.[index]?.title}
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
                                name={`awards.${index}.year`}
                                label="Year"
                                placeholder="2024"
                                fullWidth
                                error={touched.awards?.[index]?.year && errors.awards?.[index]?.year}
                                helperText={touched.awards?.[index]?.year && errors.awards?.[index]?.year}
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
                              <Field
                                as={TextField}
                                name={`awards.${index}.organization`}
                                label="Organization/Event"
                                placeholder="e.g., Creative Arts Guild, Art Competition 2024"
                                fullWidth
                                error={touched.awards?.[index]?.organization && errors.awards?.[index]?.organization}
                                helperText={touched.awards?.[index]?.organization && errors.awards?.[index]?.organization}
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
                              <Field
                                as={TextField}
                                name={`awards.${index}.description`}
                                label="Description"
                                multiline
                                rows={3}
                                placeholder="Describe what this award was for and why it's significant..."
                                fullWidth
                                error={touched.awards?.[index]?.description && errors.awards?.[index]?.description}
                                helperText={touched.awards?.[index]?.description && errors.awards?.[index]?.description}
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
                        onClick={() => push({ title: "", year: "", description: "", organization: "" })}
                        sx={{
                          borderColor: "#00a1e0",
                          color: "#00a1e0",
                          "&:hover": {
                            borderColor: "#007bb5",
                            backgroundColor: "rgba(0, 161, 224, 0.1)"
                          }
                        }}
                      >
                        Add Award
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
                        {submitting ? 'Saving...' : 'Save Awards'}
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
