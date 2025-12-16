"use client";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton,
  CircularProgress,
  Alert,
  FormLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip
} from "@mui/material";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import WorkIcon from "@mui/icons-material/Work";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ShareIcon from "@mui/icons-material/Share";
import EditIcon from "@mui/icons-material/Edit";
import ListIcon from "@mui/icons-material/List";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import { toast } from "react-hot-toast";
import { useNotifications } from "@/hooks/useNotifications";

// Validation Schema
const projectsSchema = Yup.object().shape({
  projects: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required("Project title is required"),
      description: Yup.string().required("Project description is required"),
      clientName: Yup.string().required("Client name is required"),
      clientEmail: Yup.string().email("Invalid email").required("Client email is required"),
      startDate: Yup.date().required("Start date is required"),
      endDate: Yup.date().required("End date is required"),
      status: Yup.string().required("Status is required"),
      category: Yup.string().required("Category is required"),
      budget: Yup.number().min(300, "Minimum budget is ₹300").required("Budget is required")
    })
  )
});

const projectStatuses = ["Planning", "In Progress", "Completed", "On Hold", "Cancelled"];
const projectCategories = [
  "Digital Art", "3D Modeling", "Logo Design", "UI/UX Design", "Animation", 
  "Video Editing", "Illustration", "Web Design", "Branding", "Other"
];

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const notify = useNotifications();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" or "form"
  const [editingProject, setEditingProject] = useState(null);
  const [initialData, setInitialData] = useState({
    projects: []
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

    fetchProjects();
  }, [session?.user?.artistid, status]);

  // Reset data loaded flag when user logs out
  useEffect(() => {
    if (status === "unauthenticated") {
      dataLoadedRef.current = false;
    }
  }, [status]);
  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/portfolio/projects');
      if (response.ok) {
        const data = await response.json();
        if (data.projects && data.projects.length > 0) {
          setInitialData({ projects: data.projects });
        }
      }
      
      // Mark data as loaded
      dataLoadedRef.current = true;
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects data');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (values) => {
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/portfolio/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });      if (response.ok) {
        notify.actionComplete('update_project', 'projects');
        
        // Add to dashboard notification center
        if (typeof window !== 'undefined' && window.addDashboardNotification) {
          window.addDashboardNotification(
            'success', 
            'Projects saved successfully!',
            'update_project',
            'projects'
          );
        }
        
        setInitialData(values); // Update the data
        setViewMode("list"); // Switch to list view after saving
        setEditingProject(null); // Clear any editing state
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save projects');
      }    } catch (error) {
      console.error('Error saving projects:', error);
      notify.error(error.message || 'Failed to save projects');
      
      // Add error notification to dashboard
      if (typeof window !== 'undefined' && window.addDashboardNotification) {
        window.addDashboardNotification(
          'error', 
          `Failed to save projects: ${error.message || 'Unknown error'}`,
          'save_project_error'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const generateFeedbackForm = (project) => {
    const baseUrl = window.location.origin;
    const feedbackUrl = `${baseUrl}/feedback/${session.user.artistid}?project=${encodeURIComponent(project.title)}`;
    return feedbackUrl;
  };

  const sendFeedbackForm = (project) => {
    const feedbackUrl = generateFeedbackForm(project);
    navigator.clipboard.writeText(feedbackUrl);
    toast.success('Feedback form link copied to clipboard!');
    setSelectedProject(project);
    setFeedbackDialogOpen(true);
  };

  const getCompletedProjectsCount = (projects) => {
    return projects.filter(project => project.status === "Completed").length;
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "#4caf50";
      case "In Progress": return "#2196f3";
      case "Planning": return "#ff9800";
      case "On Hold": return "#9c27b0";
      case "Cancelled": return "#f44336";
      default: return "#757575";
    }
  };

  const handleEditProject = (project, index) => {
    setEditingProject({ ...project, index });
    setViewMode("form");
  };

  const handleDeleteProject = async (index) => {
    const updatedProjects = initialData.projects.filter((_, i) => i !== index);
    const updatedData = { projects: updatedProjects };
    
    try {
      const response = await fetch('/api/portfolio/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });      if (response.ok) {
        setInitialData(updatedData);
        notify.actionComplete('delete_project', 'project');
        
        // Add to dashboard notification center
        if (typeof window !== 'undefined' && window.addDashboardNotification) {
          window.addDashboardNotification(
            'success', 
            'Project deleted successfully!',
            'delete_project',
            'project'
          );
        }
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      notify.error('Failed to delete project');
      
      // Add error notification to dashboard
      if (typeof window !== 'undefined' && window.addDashboardNotification) {
        window.addDashboardNotification(
          'error', 
          'Failed to delete project',
          'delete_project_error'
        );
      }
    }
  };

  const handleAddNewProject = () => {
    setEditingProject(null);
    setViewMode("form");
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
        padding: { xs: 2, sm: 3 }
      }}
    >
      <Box
        sx={{
          width: '100%',
          
          backgroundColor: '#1a1e23',
          borderRadius: 2,
          padding: { xs: 3, sm: 4 }
        }}
      >
        <Typography variant="h4" sx={{ color: "#fff", mb: 1 }}>
          Project Management
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#78838D", mb: 4, fontSize: "14px" }}
        >
          Manage your projects and track completion for client feedback and ratings.
          Artist ID: <strong>{session?.user?.artistid}</strong>
        </Typography>

        {/* Project Statistics */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 3, 
          mb: 4 
        }}>
          <Box sx={{ 
            backgroundColor: "#2a2e33", 
            borderRadius: 2, 
            p: 3, 
            flex: 1,
            textAlign: 'center'
          }}>
            <WorkIcon sx={{ color: "#00a1e0", fontSize: 40, mb: 1 }} />
            <Typography variant="h4" sx={{ color: "#00a1e0", mb: 1 }}>
              {initialData.projects.length}
            </Typography>
            <Typography variant="body1" sx={{ color: "#ccc" }}>
              Total Projects
            </Typography>
          </Box>
          
          <Box sx={{ 
            backgroundColor: "#2a2e33", 
            borderRadius: 2, 
            p: 3, 
            flex: 1,
            textAlign: 'center'
          }}>
            <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 40, mb: 1 }} />
            <Typography variant="h4" sx={{ color: "#4caf50", mb: 1 }}>
              {getCompletedProjectsCount(initialData.projects)}
            </Typography>
            <Typography variant="body1" sx={{ color: "#ccc" }}>
              Completed Projects
            </Typography>
          </Box>

          <Box sx={{ 
            backgroundColor: "#2a2e33", 
            borderRadius: 2, 
            p: 3, 
            flex: 1,
            textAlign: 'center'
          }}>
            <AccessTimeIcon sx={{ color: "#ff9800", fontSize: 40, mb: 1 }} />
            <Typography variant="h4" sx={{ color: "#ff9800", mb: 1 }}>
              {initialData.projects.filter(p => p.status === "In Progress").length}
            </Typography>
            <Typography variant="body1" sx={{ color: "#ccc" }}>
              In Progress
            </Typography>
          </Box>        </Box>
        
        {/* View Mode Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={viewMode} 
            onChange={(e, newValue) => setViewMode(newValue)}
            sx={{
              "& .MuiTabs-indicator": { backgroundColor: "#00a1e0" },
              "& .MuiTab-root": { color: "#ccc" },
              "& .Mui-selected": { color: "#00a1e0 !important" }
            }}
          >
            <Tab 
              label="List View" 
              value="list" 
              icon={<ListIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Form View" 
              value="form" 
              icon={<ViewModuleIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {viewMode === "list" ? (
          // LIST VIEW
          <Box sx={{ backgroundColor: "#23272b", borderRadius: 2, p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5" sx={{ color: "#fff" }}>
                Your Projects ({initialData.projects.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNewProject}
                sx={{
                  backgroundColor: "#00a1e0",
                  "&:hover": { backgroundColor: "#007bb5" }
                }}
              >
                Add New Project
              </Button>
            </Box>

            {initialData.projects.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <WorkIcon sx={{ fontSize: 60, color: "#555", mb: 2 }} />
                <Typography variant="h6" sx={{ color: "#ccc", mb: 1 }}>
                  No projects yet
                </Typography>
                <Typography variant="body2" sx={{ color: "#999", mb: 3 }}>
                  Create your first project to start managing your work and collecting client feedback.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddNewProject}
                  sx={{
                    backgroundColor: "#00a1e0",
                    "&:hover": { backgroundColor: "#007bb5" }
                  }}
                >
                  Add Your First Project
                </Button>
              </Box>
            ) : (
              <TableContainer 
                component={Paper} 
                sx={{ 
                  backgroundColor: "#1a1e23",
                  "& .MuiTableCell-root": { borderColor: "#333" }
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#2a2e33" }}>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Project</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Client</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Category</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Budget</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Dates</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {initialData.projects.map((project, index) => (
                      <TableRow 
                        key={index}
                        sx={{ 
                          "&:hover": { backgroundColor: "#2a2e33" },
                          backgroundColor: index % 2 === 0 ? "#1a1e23" : "#242831"
                        }}
                      >
                        <TableCell sx={{ color: "#fff" }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ color: "#00a1e0", fontWeight: "bold" }}>
                              {project.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#ccc" }}>
                              {project.description.length > 50 
                                ? `${project.description.substring(0, 50)}...` 
                                : project.description
                              }
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: "#fff" }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                              {project.clientName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#ccc" }}>
                              {project.clientEmail}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={project.status}
                            size="small"
                            sx={{
                              backgroundColor: getStatusColor(project.status),
                              color: "#fff",
                              fontWeight: "bold"
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: "#ccc" }}>
                          {project.category}
                        </TableCell>
                        <TableCell sx={{ color: "#4caf50", fontWeight: "bold" }}>
                          ${project.budget?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell sx={{ color: "#ccc" }}>
                          <Typography variant="caption" sx={{ display: "block" }}>
                            Start: {new Date(project.startDate).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" sx={{ display: "block" }}>
                            End: {new Date(project.endDate).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                            {project.status === "Completed" && (
                              <Tooltip title="Send Feedback Form">
                                <IconButton
                                  size="small"
                                  onClick={() => sendFeedbackForm(project)}
                                  sx={{ color: "#00a1e0" }}
                                >
                                  <ShareIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Edit Project">
                              <IconButton
                                size="small"
                                onClick={() => handleEditProject(project, index)}
                                sx={{ color: "#ff9800" }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Project">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteProject(index)}
                                sx={{ color: "#f44336" }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        ) : (
          // FORM VIEW
        <Box sx={{ backgroundColor: "#23272b", borderRadius: 2, p: { xs: 3, sm: 4 } }}>
          <Formik
            initialValues={initialData}
            validationSchema={projectsSchema}
            enableReinitialize={true}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form>
                <FieldArray name="projects">
                  {({ push, remove }) => (
                    <>
                      {values.projects.map((project, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            mb: 4, 
                            backgroundColor: "#2a2e33", 
                            borderRadius: 2,
                            p: 3,
                            border: '1px solid #333'
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                            <Typography variant="h6" sx={{ color: "#00a1e0" }}>
                              Project {index + 1}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {project.status === "Completed" && (
                                <Button
                                  variant="outlined"
                                  startIcon={<ShareIcon />}
                                  onClick={() => sendFeedbackForm(project)}
                                  sx={{
                                    borderColor: "#00a1e0",
                                    color: "#00a1e0",
                                    fontSize: "0.8rem",
                                    "&:hover": {
                                      borderColor: "#007bb5",
                                      backgroundColor: "rgba(0, 161, 224, 0.1)"
                                    }
                                  }}
                                >
                                  Send Feedback Form
                                </Button>
                              )}
                              {values.projects.length > 1 && (
                                <IconButton
                                  onClick={() => remove(index)}
                                  sx={{ color: "#ff4444" }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Project Title and Status */}
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>
                                  Project Title *
                                </FormLabel>
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={project.title}
                                  onChange={(e) => setFieldValue(`projects.${index}.title`, e.target.value)}
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
                                {touched.projects?.[index]?.title && errors.projects?.[index]?.title && (
                                  <Typography variant="caption" sx={{ color: "#ff4444", mt: 1, display: 'block' }}>
                                    {errors.projects[index].title}
                                  </Typography>
                                )}
                              </Box>

                              <Box sx={{ flex: 1 }}>
                                <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>
                                  Status *
                                </FormLabel>
                                <Select
                                  fullWidth
                                  size="small"
                                  value={project.status}
                                  onChange={(e) => setFieldValue(`projects.${index}.status`, e.target.value)}
                                  sx={{
                                    backgroundColor: "#1a1e23",
                                    color: "#fff",
                                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#333" },
                                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#00a1e0" },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#00a1e0" }
                                  }}
                                >
                                  {projectStatuses.map((status) => (
                                    <MenuItem key={status} value={status}>
                                      <Chip
                                        label={status}
                                        size="small"
                                        sx={{
                                          backgroundColor: getStatusColor(status),
                                          color: "#fff",
                                          fontSize: "0.8rem"
                                        }}
                                      />
                                    </MenuItem>
                                  ))}
                                </Select>
                              </Box>
                            </Box>

                            {/* Description */}
                            <Box>
                              <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>
                                Project Description *
                              </FormLabel>
                              <TextField
                                fullWidth
                                multiline
                                rows={3}
                                size="small"
                                value={project.description}
                                onChange={(e) => setFieldValue(`projects.${index}.description`, e.target.value)}
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
                            </Box>

                            {/* Client Information */}
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>
                                  Client Name *
                                </FormLabel>
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={project.clientName}
                                  onChange={(e) => setFieldValue(`projects.${index}.clientName`, e.target.value)}
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
                              </Box>

                              <Box sx={{ flex: 1 }}>
                                <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>
                                  Client Email *
                                </FormLabel>
                                <TextField
                                  fullWidth
                                  size="small"
                                  type="email"
                                  value={project.clientEmail}
                                  onChange={(e) => setFieldValue(`projects.${index}.clientEmail`, e.target.value)}
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
                              </Box>
                            </Box>

                            {/* Dates and Budget */}
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>
                                  Start Date *
                                </FormLabel>
                                <TextField
                                  fullWidth
                                  size="small"
                                  type="date"
                                  value={project.startDate}
                                  onChange={(e) => setFieldValue(`projects.${index}.startDate`, e.target.value)}
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
                              </Box>

                              <Box sx={{ flex: 1 }}>
                                <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>
                                  End Date *
                                </FormLabel>
                                <TextField
                                  fullWidth
                                  size="small"
                                  type="date"
                                  value={project.endDate}
                                  onChange={(e) => setFieldValue(`projects.${index}.endDate`, e.target.value)}
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
                              </Box>

                              <Box sx={{ flex: 1 }}>
                                <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>
                                  Budget ($) *
                                </FormLabel>
                                <TextField
                                  fullWidth
                                  size="small"
                                  type="number"
                                  value={project.budget}
                                  onChange={(e) => setFieldValue(`projects.${index}.budget`, e.target.value)}
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
                              </Box>
                            </Box>

                            {/* Category */}
                            <Box>
                              <FormLabel sx={{ color: "#fff", mb: 1, display: 'block' }}>
                                Category *
                              </FormLabel>
                              <Select
                                fullWidth
                                size="small"
                                value={project.category}
                                onChange={(e) => setFieldValue(`projects.${index}.category`, e.target.value)}
                                sx={{
                                  backgroundColor: "#1a1e23",
                                  color: "#fff",
                                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#333" },
                                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#00a1e0" },
                                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#00a1e0" }
                                }}
                              >
                                {projectCategories.map((category) => (
                                  <MenuItem key={category} value={category}>
                                    {category}
                                  </MenuItem>
                                ))}
                              </Select>
                            </Box>
                          </Box>
                        </Box>
                      ))}

                      <Box sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 3 }}>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => push({ 
                            title: "", 
                            description: "", 
                            clientName: "", 
                            clientEmail: "",
                            startDate: "",
                            endDate: "",
                            status: "Planning",
                            category: "Digital Art",
                            budget: 0
                          })}
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
                          Add Project
                        </Button>

                        <Button
                          type="submit"
                          variant="contained"
                          disabled={submitting}
                          startIcon={
                            submitting ? <CircularProgress size={20} color="inherit" /> : null
                          }
                          sx={{
                            backgroundColor: "#00a1e0",
                            minWidth: { xs: '100%', sm: 'auto' },
                            "&:hover": { backgroundColor: "#007bb5" },
                            "&:disabled": { backgroundColor: "#333" }
                          }}                        >
                          {submitting ? "Saving..." : "Save Projects"}
                        </Button>
                      </Box>
                    </>
                  )}
                </FieldArray>
              </Form>
            )}
          </Formik>
        </Box>
        )}

        {/* Information Note */}
        <Box 
          sx={{ 
            backgroundColor: "#1a1e23", 
            borderRadius: 2,
            p: 3, 
            mt: 4,
            border: "1px solid #00a1e0" 
          }}
        >
          <Typography variant="body1" sx={{ color: "#00a1e0", mb: 1 }}>
            📋 Project Management Tips
          </Typography>
          <Typography variant="body2" sx={{ color: "#ccc" }}>
            • Mark projects as "Completed" to send feedback forms to clients<br/>
            • Your completed project count is displayed on your ratings page<br/>
            • Client feedback forms help you gather reviews and improve your ratings<br/>
            • Keep project information accurate for better client communication
          </Typography>
        </Box>
      </Box>

      {/* Feedback Form Dialog */}
      <Dialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "#1a1e23",
            color: "#fff"
          }
        }}
      >
        <DialogTitle sx={{ color: "#00a1e0" }}>
          Client Feedback Form Generated
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Feedback form link has been copied to your clipboard. Share this link with your client:
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              backgroundColor: "#2a2e33", 
              p: 2, 
              borderRadius: 1,
              wordBreak: "break-all",
              fontFamily: "monospace"
            }}
          >
            {selectedProject && generateFeedbackForm(selectedProject)}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, color: "#ccc" }}>
            Send this link to <strong>{selectedProject?.clientName}</strong> ({selectedProject?.clientEmail}) 
            so they can submit their rating and review for the project "{selectedProject?.title}".
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setFeedbackDialogOpen(false)}
            sx={{ color: "#00a1e0" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
