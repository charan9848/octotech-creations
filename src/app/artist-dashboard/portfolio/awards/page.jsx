"use client";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton,
  CircularProgress,
  Alert,
  FormLabel
} from "@mui/material";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { toast } from "react-hot-toast";
import { useNotifications } from "@/hooks/useNotifications";

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
  const notify = useNotifications();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialData, setInitialData] = useState({
    awards: [{ title: "", year: "", description: "", organization: "" }]
  });

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

    fetchAwards();
  }, [session?.user?.artistid, status]);
  // Reset data loaded flag when user logs out
  useEffect(() => {
    if (status === "unauthenticated") {
      dataLoadedRef.current = false;
    }
  }, [status]);
  const fetchAwards = async () => {
    try {
      const response = await fetch('/api/portfolio/awards');
      if (response.ok) {
        const data = await response.json();
        if (data.awards && data.awards.length > 0) {
          setInitialData({ awards: data.awards });
        }
      }
      
      // Mark data as loaded
      dataLoadedRef.current = true;
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
      });      if (response.ok) {
        toast.success('Awards saved successfully!');
        notify.actionComplete('awards_save', `${values.awards.length} awards`);
        // Add notification to dashboard
        if (window.addDashboardNotification) {
          window.addDashboardNotification('success', `Successfully saved ${values.awards.length} awards`, 'awards_save');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save awards');
      }
    } catch (error) {
      console.error('Error saving awards:', error);
      const errorMessage = error.message || 'Failed to save awards';
      toast.error(errorMessage);
      notify.error(errorMessage);
      // Add error notification to dashboard
      if (window.addDashboardNotification) {
        window.addDashboardNotification('error', 'Failed to save awards', 'awards_error');
      }
    } finally {
      setSubmitting(false);
    }
  };
  if (status === "loading" || loading) {
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
            backgroundColor: '#1a1e23',
            borderRadius: 2,
            padding: 6,
            minWidth: 300,
            textAlign: 'center'
          }}
        >
          <CircularProgress sx={{ color: '#00a1e0' }} />
          <Typography sx={{ mt: 2, color: '#fff' }}>Loading...</Typography>
        </Box>
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: 2, sm: 3 }
      }}
    >
      <Box
        sx={{
          backgroundColor: '#1a1e23',
          borderRadius: 2,
          padding: { xs: 3, sm: 4, md: 6 },
   
          width: '100%'
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            color: "#fff", 
            mb: 1,
            textAlign: 'center',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
          }}
        >
          Awards & Recognition
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: "#ccc", 
            mb: 4,
            textAlign: 'center',
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}
        >
          Showcase your achievements, awards, and recognitions in the art industry.
        </Typography>
        
        <Box
          sx={{
            backgroundColor: '#23272b',
            borderRadius: 2,
            padding: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <Formik
          initialValues={initialData}
          validationSchema={awardsSchema}
          enableReinitialize={true}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched }) => (
            <Form>              <FieldArray name="awards">
                {({ push, remove }) => (
                  <Box>
                    {values.awards.map((award, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          mb: 3, 
                          backgroundColor: "#2a2e33", 
                          borderRadius: 2,
                          padding: { xs: 2, sm: 3 }
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
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
                        
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: 3
                          }}
                        >
                          <Box 
                            sx={{ 
                              display: 'flex',
                              flexDirection: { xs: 'column', md: 'row' },
                              gap: { xs: 3, md: 2 }
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <FormLabel sx={{ color: '#00a1e0', fontSize: '0.875rem', mb: 1, display: 'block' }}>
                                Award Title
                              </FormLabel>
                              <Field
                                as={TextField}
                                name={`awards.${index}.title`}
                                placeholder="e.g., Best Digital Art 2024"
                                fullWidth
                                error={touched.awards?.[index]?.title && errors.awards?.[index]?.title}
                                helperText={touched.awards?.[index]?.title && errors.awards?.[index]?.title}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    color: "#fff",
                                    backgroundColor: '#1a1e23',
                                    "& fieldset": { borderColor: "#404040" },
                                    "&:hover fieldset": { borderColor: "#00a1e0" },
                                    "&.Mui-focused fieldset": { borderColor: "#00a1e0" }
                                  }
                                }}
                              />
                            </Box>
                            
                            <Box sx={{ flex: 1 }}>
                              <FormLabel sx={{ color: '#00a1e0', fontSize: '0.875rem', mb: 1, display: 'block' }}>
                                Year
                              </FormLabel>
                              <Field
                                as={TextField}
                                name={`awards.${index}.year`}
                                placeholder="2024"
                                fullWidth
                                error={touched.awards?.[index]?.year && errors.awards?.[index]?.year}
                                helperText={touched.awards?.[index]?.year && errors.awards?.[index]?.year}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    color: "#fff",
                                    backgroundColor: '#1a1e23',
                                    "& fieldset": { borderColor: "#404040" },
                                    "&:hover fieldset": { borderColor: "#00a1e0" },
                                    "&.Mui-focused fieldset": { borderColor: "#00a1e0" }
                                  }
                                }}
                              />
                            </Box>
                          </Box>
                          
                          <Box>
                            <FormLabel sx={{ color: '#00a1e0', fontSize: '0.875rem', mb: 1, display: 'block' }}>
                              Organization/Event
                            </FormLabel>
                            <Field
                              as={TextField}
                              name={`awards.${index}.organization`}
                              placeholder="e.g., Creative Arts Guild, Art Competition 2024"
                              fullWidth
                              error={touched.awards?.[index]?.organization && errors.awards?.[index]?.organization}
                              helperText={touched.awards?.[index]?.organization && errors.awards?.[index]?.organization}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  color: "#fff",
                                  backgroundColor: '#1a1e23',
                                  "& fieldset": { borderColor: "#404040" },
                                  "&:hover fieldset": { borderColor: "#00a1e0" },
                                  "&.Mui-focused fieldset": { borderColor: "#00a1e0" }
                                }
                              }}
                            />
                          </Box>
                          
                          <Box>
                            <FormLabel sx={{ color: '#00a1e0', fontSize: '0.875rem', mb: 1, display: 'block' }}>
                              Description
                            </FormLabel>
                            <Field
                              as={TextField}
                              name={`awards.${index}.description`}
                              multiline
                              rows={3}
                              placeholder="Describe what this award was for and why it's significant..."
                              fullWidth
                              error={touched.awards?.[index]?.description && errors.awards?.[index]?.description}
                              helperText={touched.awards?.[index]?.description && errors.awards?.[index]?.description}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  color: "#fff",
                                  backgroundColor: '#1a1e23',
                                  "& fieldset": { borderColor: "#404040" },
                                  "&:hover fieldset": { borderColor: "#00a1e0" },
                                  "&.Mui-focused fieldset": { borderColor: "#00a1e0" }
                                }
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    ))}
                    
                    <Box 
                      sx={{ 
                        display: "flex", 
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2, 
                        mt: 4,
                        justifyContent: { xs: 'stretch', sm: 'flex-start' }
                      }}
                    >
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
                          },
                         
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
                         
                        }}
                      >
                        {submitting ? 'Saving...' : 'Save Awards'}
                      </Button>                    </Box>
                  </Box>
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
