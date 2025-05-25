import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  CssBaseline,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import WorkIcon from "@mui/icons-material/Work";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 220;

const ArtistDashboard = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/artist-login");
  }

  return (
    <Box sx={{ display: "flex", backgroundColor: "#15191c", minHeight: "100vh" }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "#23272b",
            color: "#fff",
          },
        }}
      >
        <Toolbar>
          <Typography variant="h2" sx={{ color: "#00a1e0" }}>
            Artist Panel
          </Typography>
        </Toolbar>
        <Divider />
        <List sx={{ color: "#fff" }}>
          <ListItem disablePadding selected>
            <ListItemButton>
              <ListItemIcon>
                <DashboardIcon sx={{ color: "#00a1e0" }} />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{ sx: { color: "#fff !important" } }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <WorkIcon sx={{ color: "#00a1e0" }} />
              </ListItemIcon>
              <ListItemText
                primary="Portfolio"
                primaryTypographyProps={{ sx: { color: "#fff !important" } }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <AccountCircleIcon sx={{ color: "#00a1e0" }} />
              </ListItemIcon>
              <ListItemText
                primary="Profile"
                primaryTypographyProps={{ sx: { color: "#fff !important" } }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <LogoutIcon sx={{ color: "#00a1e0" }} />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ sx: { color: "#fff !important" } }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          color: "#fff",
          backgroundColor: "#15191c",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h4" mb={2}>
          Dashboard Overview
        </Typography>
        <Typography variant="body1">
          Welcome to your artist dashboard! Here you can manage your portfolio, profile, and more.
        </Typography>
        {/* Add more dashboard widgets or content here */}
      </Box>
    </Box>
  );
};

export default ArtistDashboard;