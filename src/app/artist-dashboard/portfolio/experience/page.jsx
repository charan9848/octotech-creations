"use client";
import { Box, Typography, TextField, Button, IconButton, CircularProgress, FormHelperText, FormLabel } from "@mui/material";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import { useNotifications } from "@/hooks/useNotifications";
import axios from "axios";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ExperiencePage() {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { data: session, status } = useSession();  const router = useRouter();
  const notify = useNotifications();

  // Use ref to track if data has been loaded to prevent multiple fetches
  const dataLoadedRef = useRef(false);
  const validationSchema = useMemo(() => yup.object({
    experience: yup.array().of(
      yup.object({
        company: yup.string().required('Company is required'),
        role: yup.string().required('Role is required'),
        duration: yup.string().required('Duration is required'),
        description: yup.string().required('Description is required')
      })
    ).min(1, 'At least one experience is required')
  }), []);const formik = useFormik({
    initialValues: {
      experience: [
        { company: "", role: "", duration: "", description: "" }
      ]
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await axios.post('/api/portfolio/experience', values);
        toast.success("Experience saved successfully!");
        notify.actionComplete('experience_save', `${values.experience.length} experiences`);
        
        // Add notification to dashboard
        if (window.addDashboardNotification) {
          window.addDashboardNotification('success', `Successfully saved ${values.experience.length} experiences`, 'experience_save');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.error || "Failed to save experience";
        toast.error(errorMessage);
        notify.error(errorMessage);
        // Add error notification to dashboard
        if (window.addDashboardNotification) {
          window.addDashboardNotification('error', 'Failed to save experience', 'experience_error');
        }
      } finally {
        setLoading(false);
      }
    }
  });
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/artist-login");
      return;
    }

    // Prevent multiple API calls using ref
    if (dataLoadedRef.current) return;

    // Fetch existing experience data
    const fetchExperienceData = async () => {
      try {
        const response = await axios.get('/api/portfolio/experience');
        const { experience } = response.data;
        formik.setValues({
          experience: experience || [{ company: "", role: "", duration: "", description: "" }]
        });
        
        // Mark data as loaded
        dataLoadedRef.current = true;
      } catch (error) {
        console.error("Failed to fetch experience data:", error);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchExperienceData();
  }, [session?.user?.artistid, status]);

  // Reset data loaded flag when user logs out
  useEffect(() => {
    if (status === "unauthenticated") {
      dataLoadedRef.current = false;
    }
  }, [status]);

  const addExperience = () => {
    const newExperience = [...formik.values.experience, { company: "", role: "", duration: "", description: "" }];
    formik.setFieldValue('experience', newExperience);
  };

  const removeExperience = (index) => {
    if (formik.values.experience.length > 1) {
      const filteredExperience = formik.values.experience.filter((_, i) => i !== index);
      formik.setFieldValue('experience', filteredExperience);
    }
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperiences = formik.values.experience.map((exp, i) =>
      i === index ? { ...exp, [field]: value } : exp
    );
    formik.setFieldValue('experience', updatedExperiences);
  };

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
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        p: { xs: 2, sm: 3, md: 5 }
      }}
    >      <Box 
        sx={{ 
          width: '100%',
          
          backgroundColor: '#1a1e23',
          borderRadius: 2,
          p: { xs: 3, sm: 4 }
        }}
      >
        <Typography variant="h4" sx={{ color: "#fff", mb: 1 }}>
          Experience
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#78838D", mb: 4, fontSize: "14px" }}
        >
          Add your professional experience and artistic journey.
          Artist ID: <strong>{session?.user?.artistid}</strong>        </Typography>
        
        <Box sx={{ backgroundColor: "#23272b", borderRadius: 2, p: { xs: 3, sm: 4 } }}>
          <form onSubmit={formik.handleSubmit}>            {formik.values.experience.map((experience, index) => (
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
                    Experience {index + 1}
                  </Typography>
                  {formik.values.experience.length > 1 && (
                    <IconButton
                      onClick={() => removeExperience(index)}
                      sx={{ color: "#ff4444" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'column', md: 'row' }, gap: { xs: 2, md: 2 } }}>
                  <Box sx={{ flex: { md: '1 1 50%' }, width: { xs: '100%' } }}>
                    <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Company *</FormLabel>
                    <TextField
                      fullWidth                      size="small"
                      placeholder="Company/Organization Name"
                      value={experience.company}
                      onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
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
                  </Box>
                  
                  <Box sx={{ flex: { md: '1 1 50%' }, width: { xs: '100%' } }}>
                    <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Role *</FormLabel>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Job Title/Position"
                      value={experience.role}
                      onChange={(e) => handleExperienceChange(index, "role", e.target.value)}
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
                  </Box>
                </Box>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 2 }, mt: 2 }}>
                  <Box sx={{ flex: { md: '1 1 50%' }, width: { xs: '100%' } }}>
                    <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Duration *</FormLabel>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="e.g., Jan 2020 - Dec 2022"
                      value={experience.duration}
                      onChange={(e) => handleExperienceChange(index, "duration", e.target.value)}
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
                  </Box>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Description *</FormLabel>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    placeholder="Describe your responsibilities, achievements, and key projects..."
                    value={experience.description}
                    onChange={(e) => handleExperienceChange(index, "description", e.target.value)}
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
                </Box>
              </Box>
            ))}

            <Button
              onClick={addExperience}
              startIcon={<AddIcon />}
              sx={{
                mb: 3,
                color: "#00a1e0",
                borderColor: "#00a1e0",
                "&:hover": {
                  borderColor: "#007bb5",
                  backgroundColor: "rgba(0, 161, 224, 0.1)"
                }
              }}
              variant="outlined"
            >
              Add Experience
            </Button>

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
              {loading ? "Saving..." : "Save Experience"}            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
}
