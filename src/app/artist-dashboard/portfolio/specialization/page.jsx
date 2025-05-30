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
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save specialization');
      }
    } catch (error) {
      console.error('Error saving specialization:', error);
      toast.error(error.message || 'Failed to save specialization');
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
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#00a1e0' }} />
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
        p: 4
      }}
    >
      <Box
        sx={{
          maxWidth: '800px',
          mx: 'auto'
        }}
      >
        <Typography variant="h4" color="white" mb={1}>
          Specialization
        </Typography>
        <Typography
          variant="body2"
          color="#78838D"
          mb={4}
          fontSize="14px"
        >
          Define your skills, expertise levels, and tools. This helps clients understand your capabilities.
        </Typography>
        
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
                  <Box>
                    {values.specializations.map((specialization, index) => (
                      <Box key={index} sx={{ mb: 4, p: 3, border: '1px solid #333', borderRadius: '8px' }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
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
                        
                        <Box sx={{ mb: 3 }}>
                          <FormLabel sx={{ color: "#00a1e0" }}>Skill/Specialization *</FormLabel>
                          <Field
                            as={TextField}
                            name={`specializations.${index}.skill`}
                            placeholder="e.g., 3D Modeling, Digital Painting"
                            fullWidth
                            size="small"
                            error={touched.specializations?.[index]?.skill && Boolean(errors.specializations?.[index]?.skill)}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                color: "#fff",
                                "& fieldset": { borderColor: "#00a1e0" },
                                "&:hover fieldset": { borderColor: "#007bb5" }
                              }
                            }}
                          />
                          <FormHelperText sx={{ minHeight: "10px" }} error>
                            {touched.specializations?.[index]?.skill && errors.specializations?.[index]?.skill}
                          </FormHelperText>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                          <Box sx={{ flex: 1 }}>
                            <FormLabel sx={{ color: "#00a1e0" }}>Level *</FormLabel>
                            <Field
                              as={Select}
                              name={`specializations.${index}.level`}
                              fullWidth
                              size="small"
                              error={touched.specializations?.[index]?.level && Boolean(errors.specializations?.[index]?.level)}
                              sx={{
                                color: "#fff",
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#00a1e0" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#007bb5" },
                                "& .MuiSvgIcon-root": { color: "#00a1e0" }
                              }}
                            >
                              {skillLevels.map((level) => (
                                <MenuItem key={level} value={level} sx={{ backgroundColor: "#23272b", color: "#fff" }}>
                                  {level}
                                </MenuItem>
                              ))}
                            </Field>
                            <FormHelperText sx={{ minHeight: "10px" }} error>
                              {touched.specializations?.[index]?.level && errors.specializations?.[index]?.level}
                            </FormHelperText>
                          </Box>
                          
                          <Box sx={{ flex: 1 }}>
                            <FormLabel sx={{ color: "#00a1e0" }}>Years of Experience *</FormLabel>
                            <Field
                              as={TextField}
                              name={`specializations.${index}.yearsOfExperience`}
                              type="number"
                              fullWidth
                              size="small"
                              error={touched.specializations?.[index]?.yearsOfExperience && Boolean(errors.specializations?.[index]?.yearsOfExperience)}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  color: "#fff",
                                  "& fieldset": { borderColor: "#00a1e0" },
                                  "&:hover fieldset": { borderColor: "#007bb5" }
                                }
                              }}
                            />
                            <FormHelperText sx={{ minHeight: "10px" }} error>
                              {touched.specializations?.[index]?.yearsOfExperience && errors.specializations?.[index]?.yearsOfExperience}
                            </FormHelperText>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                    
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => push({ skill: "", level: "", yearsOfExperience: 0 })}
                      sx={{
                        borderColor: "#00a1e0",
                        color: "#00a1e0",
                        mb: 4,
                        "&:hover": {
                          borderColor: "#007bb5",
                          backgroundColor: "rgba(0, 161, 224, 0.1)"
                        }
                      }}
                    >
                      Add Specialization
                    </Button>
                  </Box>
                )}
              </FieldArray>

              {/* Primary Skills */}
              <Typography variant="h6" sx={{ color: "#00a1e0", mb: 3 }}>
                Primary Skills
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <FormLabel sx={{ color: "#00a1e0" }}>Add Primary Skill</FormLabel>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
                        color: "#fff",
                        "& fieldset": { borderColor: "#00a1e0" },
                        "&:hover fieldset": { borderColor: "#007bb5" }
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
                      "&:hover": {
                        borderColor: "#007bb5",
                        backgroundColor: "rgba(0, 161, 224, 0.1)"
                      }
                    }}
                  >
                    Add Skill
                  </Button>
                </Box>
                
                <Typography variant="body2" sx={{ color: "#78838D", mb: 2 }}>
                  Suggested skills:
                </Typography>
                <Box sx={{ mb: 3 }}>
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
                        m: 0.5,
                        backgroundColor: "#1a1e23",
                        color: "#00a1e0",
                        "&:hover": { backgroundColor: "#00a1e0", color: "#fff" }
                      }}
                    />
                  ))}
                </Box>
                
                <Typography variant="body2" sx={{ color: "#78838D", mb: 2 }}>
                  Your skills:
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {values.primarySkills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      onDelete={() => removeFromList(values.primarySkills, skill, setFieldValue, 'primarySkills')}
                      sx={{
                        m: 0.5,
                        backgroundColor: "#00a1e0",
                        color: "#fff"
                      }}
                    />
                  ))}
                </Box>
                
                <FormHelperText sx={{ minHeight: "10px" }} error>
                  {touched.primarySkills && errors.primarySkills}
                </FormHelperText>
              </Box>

              {/* Tools */}
              <Typography variant="h6" sx={{ color: "#00a1e0", mb: 3 }}>
                Tools & Software
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <FormLabel sx={{ color: "#00a1e0" }}>Add Tool/Software</FormLabel>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
                        color: "#fff",
                        "& fieldset": { borderColor: "#00a1e0" },
                        "&:hover fieldset": { borderColor: "#007bb5" }
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
                      "&:hover": {
                        borderColor: "#007bb5",
                        backgroundColor: "rgba(0, 161, 224, 0.1)"
                      }
                    }}
                  >
                    Add Tool
                  </Button>
                </Box>
                
                <Typography variant="body2" sx={{ color: "#78838D", mb: 2 }}>
                  Popular tools:
                </Typography>
                <Box sx={{ mb: 3 }}>
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
                        m: 0.5,
                        backgroundColor: "#1a1e23",
                        color: "#00a1e0",
                        "&:hover": { backgroundColor: "#00a1e0", color: "#fff" }
                      }}
                    />
                  ))}
                </Box>
                
                <Typography variant="body2" sx={{ color: "#78838D", mb: 2 }}>
                  Your tools:
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {values.tools.map((tool) => (
                    <Chip
                      key={tool}
                      label={tool}
                      onDelete={() => removeFromList(values.tools, tool, setFieldValue, 'tools')}
                      sx={{
                        m: 0.5,
                        backgroundColor: "#00a1e0",
                        color: "#fff"
                      }}
                    />
                  ))}
                </Box>
                
                <FormHelperText sx={{ minHeight: "10px" }} error>
                  {touched.tools && errors.tools}
                </FormHelperText>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{
                  backgroundColor: "#00a1e0",
                  "&:hover": { backgroundColor: "#007bb5" },
                  color: "#fff",
                  py: 1.5
                }}
              >
                {submitting ? 'Saving...' : 'Save Specialization'}
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
}
