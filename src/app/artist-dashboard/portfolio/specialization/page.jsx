"use client";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Chip,
  IconButton,
  FormLabel,
  FormHelperText,
  Select,
  MenuItem
} from "@mui/material";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-hot-toast";
import { useNotifications } from "@/hooks/useNotifications";

// Validation Schema
const specializationSchema = Yup.object().shape({
  specializations: Yup.array().of(
    Yup.object().shape({
      skill: Yup.string().required("Skill is required"),
      level: Yup.string().required("Level is required"),
      yearsOfExperience: Yup.number()
        .min(0, "Years of experience must be 0 or greater")
        .required("Years of experience is required")
    })
  ).min(1, "At least one specialization is required"),
  primarySkills: Yup.array().of(Yup.string()).min(1, "At least one primary skill is required"),
  tools: Yup.array().of(Yup.string()).min(1, "At least one tool is required")
});

const skillLevels = [
  "Beginner",
  "Intermediate", 
  "Advanced",
  "Expert",
  "Master"
];

const predefinedSkills = [
  "Digital Painting",
  "3D Modeling",
  "Character Design",
  "Concept Art",
  "UI/UX Design",
  "Logo Design",
  "Illustration",
  "Animation",
  "Photo Editing",
  "Graphic Design",
  "Web Design",
  "Game Art",
  "Architectural Visualization",
  "Product Design",
  "Typography"
];

const predefinedTools = [
  "Adobe Photoshop",
  "Adobe Illustrator", 
  "Blender",
  "Maya",
  "ZBrush",
  "Figma",
  "Adobe XD",
  "Cinema 4D",
  "After Effects",
  "Procreate",
  "CorelDRAW",
  "Sketch",
  "3ds Max",
  "Substance Painter",
  "Unity"
];

export default function SpecializationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const notify = useNotifications();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newTool, setNewTool] = useState("");
  const [initialData, setInitialData] = useState({
    specializations: [{ skill: "", level: "", yearsOfExperience: 0 }],
    primarySkills: [],
    tools: []
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/signin");
      return;
    }

    fetchSpecialization();
  }, [session, status]);

  const fetchSpecialization = async () => {
    try {
      const response = await fetch('/api/portfolio/specialization');
      if (response.ok) {
        const data = await response.json();
        if (data.specialization) {
          setInitialData({
            specializations: data.specialization.specializations || [{ skill: "", level: "", yearsOfExperience: 0 }],
            primarySkills: data.specialization.primarySkills || [],
            tools: data.specialization.tools || []
          });
        }
      }
    } catch (error) {
      console.error('Error fetching specialization:', error);
      toast.error('Failed to load specialization data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/portfolio/specialization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success('Specialization saved successfully!');
        notify.actionComplete('specialization_save', 'specialization data');
        // Add notification to dashboard
        if (window.addDashboardNotification) {
          window.addDashboardNotification('success', 'Specialization saved successfully', 'specialization_save');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save specialization');
      }
    } catch (error) {
      console.error('Error saving specialization:', error);
      const errorMessage = error.message || 'Failed to save specialization';
      toast.error(errorMessage);
      notify.error(errorMessage);
      // Add error notification to dashboard
      if (window.addDashboardNotification) {
        window.addDashboardNotification('error', 'Failed to save specialization', 'specialization_error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const addSkillToList = (skillsList, setFieldValue, fieldName) => {
    if (newSkill.trim() && !skillsList.includes(newSkill.trim())) {
      setFieldValue(fieldName, [...skillsList, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const addToolToList = (toolsList, setFieldValue, fieldName) => {
    if (newTool.trim() && !toolsList.includes(newTool.trim())) {
      setFieldValue(fieldName, [...toolsList, newTool.trim()]);
      setNewTool("");
    }
  };

  const removeFromList = (list, item, setFieldValue, fieldName) => {
    const updatedList = list.filter(listItem => listItem !== item);
    setFieldValue(fieldName, updatedList);
  };
  if (status === "loading" || loading) {
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
          Specialization
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#78838D", mb: 4, fontSize: "14px" }}
        >
          Define your skills, expertise levels, and tools. This helps clients understand your capabilities.
          Artist ID: <strong>{session?.user?.artistid}</strong>        </Typography>
        
        <Box sx={{ backgroundColor: "#23272b", borderRadius: 2, p: { xs: 3, sm: 4 } }}>
          <Formik
            initialValues={initialData}
            validationSchema={specializationSchema}
            enableReinitialize={true}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form>
                {/* Main Specializations */}
                <Typography variant="h6" sx={{ color: "#00a1e0", mb: 3 }}>
                  Main Specializations
                </Typography>
                
                <FieldArray name="specializations">
                  {({ push, remove }) => (
                    <Box>                      {values.specializations.map((specialization, index) => (
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
                              Specialization {index + 1}
                            </Typography>
                            {values.specializations.length > 1 && (
                              <IconButton
                                onClick={() => remove(index)}
                                sx={{ color: "#ff4444" }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'column', md: 'row' }, gap: { xs: 2, md: 2 } }}>
                            <Box sx={{ flex: { md: '1 1 50%' }, width: { xs: '100%' } }}>
                              <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Skill/Specialization *</FormLabel>
                              <Field
                                as={TextField}
                                name={`specializations.${index}.skill`}
                                placeholder="e.g., 3D Modeling, Digital Painting"
                                fullWidth
                                size="small"
                                error={touched.specializations?.[index]?.skill && Boolean(errors.specializations?.[index]?.skill)}
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
                            <Box sx={{ flex: { md: '1 1 33%' }, width: { xs: '100%' } }}>
                              <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Level *</FormLabel><Field
                                as={Select}
                                name={`specializations.${index}.level`}
                                fullWidth
                                size="small"
                                error={touched.specializations?.[index]?.level && Boolean(errors.specializations?.[index]?.level)}
                                MenuProps={{
                                  PaperProps: {
                                    sx: {
                                      backgroundColor: "#2a2e33",
                                      "& .MuiMenuItem-root": {
                                        color: "#fff",
                                        "&:hover": {
                                          backgroundColor: "#00a1e0"
                                        },
                                        "&.Mui-selected": {
                                          backgroundColor: "#00a1e0",
                                          "&:hover": {
                                            backgroundColor: "#007bb5"
                                          }
                                        }
                                      }
                                    }
                                  }
                                }}
                                sx={{
                                  mb: 1,
                                  "& .MuiOutlinedInput-root": {
                                    backgroundColor: "#1a1e23",
                                    color: "#fff",
                                    "& fieldset": { borderColor: "#333" },
                                    "&:hover fieldset": { borderColor: "#00a1e0" },
                                    "&.Mui-focused fieldset": { borderColor: "#00a1e0" }
                                  },
                                  "& .MuiSelect-select": {
                                    color: "#fff !important"
                                  },
                                  "& .MuiSvgIcon-root": { color: "#00a1e0" }
                                }}
                              >
                                {skillLevels.map((level) => (
                                  <MenuItem key={level} value={level}>
                                    {level}
                                  </MenuItem>
                                ))}
                              </Field>
                            </Box>
                              <Box sx={{ flex: { md: '1 1 16%' }, width: { xs: '100%' } }}>
                              <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Years of Experience *</FormLabel>
                              <Field
                                as={TextField}
                                name={`specializations.${index}.yearsOfExperience`}
                                type="number"
                                fullWidth
                                size="small"
                                error={touched.specializations?.[index]?.yearsOfExperience && Boolean(errors.specializations?.[index]?.yearsOfExperience)}
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
                        </Box>
                      ))}
                      
                      <Button
                        onClick={() => push({ skill: "", level: "", yearsOfExperience: 0 })}
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
                        Add Specialization
                      </Button>
                    </Box>
                  )}
                </FieldArray>

                {/* Primary Skills */}                <Typography variant="h6" sx={{ color: "#00a1e0", mb: 3 }}>
                  Primary Skills
                </Typography>
                
                <Box sx={{ mb: 3, backgroundColor: "#2a2e33", borderRadius: 2, p: 3, border: '1px solid #333' }}>
                  <Box sx={{ mb: 2 }}>
                      <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Add Primary Skill</FormLabel>                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkillToList(values.primarySkills, setFieldValue, 'primarySkills');
                            }
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#1a1e23",
                              color: "#fff",
                              "& fieldset": { borderColor: "#333" },
                              "&:hover fieldset": { borderColor: "#00a1e0" },
                              "&.Mui-focused fieldset": { borderColor: "#00a1e0" }
                            }
                          }}
                        />
                        <Button
                          variant="outlined"
                          onClick={() => addSkillToList(values.primarySkills, setFieldValue, 'primarySkills')}
                          sx={{
                            borderColor: "#00a1e0",
                            color: "#00a1e0",
                            whiteSpace: 'nowrap',
                            minWidth: { xs: '100%', sm: 'auto' },
                            "&:hover": {
                              borderColor: "#007bb5",
                              backgroundColor: "rgba(0, 161, 224, 0.1)"
                            }
                          }}
                        >
                          Add Skill
                        </Button>
                      </Box>
                      
                      <Typography variant="body2" sx={{ color: "#ccc", mb: 2 }}>
                        Suggested skills:
                      </Typography>                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {predefinedSkills.filter(skill => !values.primarySkills.includes(skill)).slice(0, 8).map((skill) => (
                          <Chip
                            key={skill}
                            label={skill}
                            onClick={() => {
                              if (!values.primarySkills.includes(skill)) {
                                setFieldValue('primarySkills', [...values.primarySkills, skill]);
                              }
                            }}
                            sx={{
                              backgroundColor: "#1a1e23",
                              color: "#00a1e0",
                              "&:hover": { backgroundColor: "#00a1e0", color: "#fff" }
                            }}
                          />
                        ))}
                      </Box>
                      
                      <Typography variant="body2" sx={{ color: "#ccc", mb: 2 }}>
                        Your skills:
                      </Typography>                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {values.primarySkills.map((skill) => (
                          <Chip
                            key={skill}
                            label={skill}
                            onDelete={() => removeFromList(values.primarySkills, skill, setFieldValue, 'primarySkills')}
                            sx={{
                              backgroundColor: "#00a1e0",
                              color: "#fff"
                            }}
                          />
                        ))}
                      </Box>
                        {touched.primarySkills && errors.primarySkills && (
                        <Typography variant="caption" sx={{ color: "#ff4444", mt: 1, display: 'block' }}>
                          {errors.primarySkills}
                        </Typography>
                      )}
                  </Box>
                </Box>

                {/* Tools */}
                <Typography variant="h6" sx={{ color: "#00a1e0", mb: 3 }}>
                  Tools & Software
                </Typography>
                
                <Box sx={{ mb: 3, backgroundColor: "#2a2e33", borderRadius: 2, p: 3, border: '1px solid #333' }}>
                  <Box sx={{ mb: 2 }}>
                      <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>Add Tool/Software</FormLabel>                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={newTool}
                          onChange={(e) => setNewTool(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addToolToList(values.tools, setFieldValue, 'tools');
                            }
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#1a1e23",
                              color: "#fff",
                              "& fieldset": { borderColor: "#333" },
                              "&:hover fieldset": { borderColor: "#00a1e0" },
                              "&.Mui-focused fieldset": { borderColor: "#00a1e0" }
                            }
                          }}
                        />
                        <Button
                          variant="outlined"
                          onClick={() => addToolToList(values.tools, setFieldValue, 'tools')}
                          sx={{
                            borderColor: "#00a1e0",
                            color: "#00a1e0",
                            whiteSpace: 'nowrap',
                            minWidth: { xs: '100%', sm: 'auto' },
                            "&:hover": {
                              borderColor: "#007bb5",
                              backgroundColor: "rgba(0, 161, 224, 0.1)"
                            }
                          }}
                        >
                          Add Tool
                        </Button>
                      </Box>
                      
                      <Typography variant="body2" sx={{ color: "#ccc", mb: 2 }}>
                        Popular tools:
                      </Typography>                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {predefinedTools.filter(tool => !values.tools.includes(tool)).slice(0, 8).map((tool) => (
                          <Chip
                            key={tool}
                            label={tool}
                            onClick={() => {
                              if (!values.tools.includes(tool)) {
                                setFieldValue('tools', [...values.tools, tool]);
                              }
                            }}
                            sx={{
                              backgroundColor: "#1a1e23",
                              color: "#00a1e0",
                              "&:hover": { backgroundColor: "#00a1e0", color: "#fff" }
                            }}
                          />
                        ))}
                      </Box>
                      
                      <Typography variant="body2" sx={{ color: "#ccc", mb: 2 }}>
                        Your tools:
                      </Typography>                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {values.tools.map((tool) => (
                          <Chip
                            key={tool}
                            label={tool}
                            onDelete={() => removeFromList(values.tools, tool, setFieldValue, 'tools')}
                            sx={{
                              backgroundColor: "#00a1e0",
                              color: "#fff"
                            }}
                          />
                        ))}
                      </Box>
                        {touched.tools && errors.tools && (
                        <Typography variant="caption" sx={{ color: "#ff4444", mt: 1, display: 'block' }}>
                          {errors.tools}
                        </Typography>
                      )}
                  </Box>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={submitting}
                  startIcon={
                    submitting ? <CircularProgress size={20} color="inherit" /> : null
                  }
                  sx={{
                    mt: 2,
                    backgroundColor: "#00a1e0",
                    "&:hover": { backgroundColor: "#007bb5" },
                    "&:disabled": { backgroundColor: "#333" }
                  }}
                >
                  {submitting ? "Saving..." : "Save Specialization"}
                </Button>
              </Form>            )}
          </Formik>
        </Box>
      </Box>
    </Box>
  );
}
