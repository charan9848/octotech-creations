"use client";
import { Box, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Typography, Dialog, DialogContent, DialogContentText, DialogActions, Button, Backdrop, CircularProgress, Collapse } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import WorkIcon from "@mui/icons-material/Work";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ImageIcon from "@mui/icons-material/Image";
import StarIcon from "@mui/icons-material/Star";
import PsychologyIcon from "@mui/icons-material/Psychology";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Add this import
import { signOut } from "next-auth/react";
import React, { useState } from "react";

const drawerWidth = 220;

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);

  const handlePortfolioClick = () => {
    setPortfolioOpen(!portfolioOpen);
  };const handleLogout = () => {
    signOut({ callbackUrl: "/artist-login" });
  };

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
          <Typography variant="h2" >
            Artist Panel
          </Typography>
        </Toolbar>
        <Divider color="white" sx={{width:'80%', display: 'block', mx: 'auto' }}/>
        <List sx={{ color: "#fff" }}>
          <ListItem disablePadding selected={pathname === "/artist-dashboard"}>
            <ListItemButton
              component={Link}
              href="/artist-dashboard"
              sx={{
                backgroundColor: pathname === "/artist-dashboard" ? "#00a1e0" : "inherit",
                "&:hover": { backgroundColor: "#007bb5" }
              }}
            >
              <ListItemIcon>
                <DashboardIcon sx={{ color: pathname === "/artist-dashboard" ? "#fff" : "#00a1e0" }} />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{
                  sx: { color: pathname === "/artist-dashboard" ? "#fff" : "#fff !important" }
                }}
              />            </ListItemButton>          </ListItem>
          
          {/* Portfolio Dropdown Section */}
          <ListItem disablePadding>
            <ListItemButton onClick={handlePortfolioClick}>
              <ListItemIcon>
                <WorkIcon sx={{ color: "#00a1e0" }} />
              </ListItemIcon>
              <ListItemText 
                primary="Portfolio" 
                primaryTypographyProps={{ sx: { color: "#fff !important" } }} 
              />
              {portfolioOpen ? <ExpandLess sx={{ color: "#00a1e0" }} /> : <ExpandMore sx={{ color: "#00a1e0" }} />}
            </ListItemButton>
          </ListItem>
          
          <Collapse in={portfolioOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding selected={pathname === "/artist-dashboard/portfolio/basic-details"}>
                <ListItemButton
                  component={Link}
                  href="/artist-dashboard/portfolio/basic-details"
                  sx={{
                    pl: 4,
                    backgroundColor: pathname === "/artist-dashboard/portfolio/basic-details" ? "#00a1e0" : "inherit",
                    "&:hover": { backgroundColor: "#007bb5" }
                  }}
                >
                  <ListItemIcon>
                    <PersonIcon sx={{ color: pathname === "/artist-dashboard/portfolio/basic-details" ? "#fff" : "#00a1e0" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Basic Details"
                    primaryTypographyProps={{
                      sx: { color: pathname === "/artist-dashboard/portfolio/basic-details" ? "#fff" : "#fff !important" }
                    }}
                  />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding selected={pathname === "/artist-dashboard/portfolio/experience"}>
                <ListItemButton
                  component={Link}
                  href="/artist-dashboard/portfolio/experience"
                  sx={{
                    pl: 4,
                    backgroundColor: pathname === "/artist-dashboard/portfolio/experience" ? "#00a1e0" : "inherit",
                    "&:hover": { backgroundColor: "#007bb5" }
                  }}
                >
                  <ListItemIcon>
                    <BusinessIcon sx={{ color: pathname === "/artist-dashboard/portfolio/experience" ? "#fff" : "#00a1e0" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Experience"
                    primaryTypographyProps={{
                      sx: { color: pathname === "/artist-dashboard/portfolio/experience" ? "#fff" : "#fff !important" }
                    }}
                  />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding selected={pathname === "/artist-dashboard/portfolio/specialization"}>
                <ListItemButton
                  component={Link}
                  href="/artist-dashboard/portfolio/specialization"
                  sx={{
                    pl: 4,
                    backgroundColor: pathname === "/artist-dashboard/portfolio/specialization" ? "#00a1e0" : "inherit",
                    "&:hover": { backgroundColor: "#007bb5" }
                  }}
                >
                  <ListItemIcon>
                    <PsychologyIcon sx={{ color: pathname === "/artist-dashboard/portfolio/specialization" ? "#fff" : "#00a1e0" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Specialization"
                    primaryTypographyProps={{
                      sx: { color: pathname === "/artist-dashboard/portfolio/specialization" ? "#fff" : "#fff !important" }
                    }}
                  />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding selected={pathname === "/artist-dashboard/portfolio/artworks"}>
                <ListItemButton
                  component={Link}
                  href="/artist-dashboard/portfolio/artworks"
                  sx={{
                    pl: 4,
                    backgroundColor: pathname === "/artist-dashboard/portfolio/artworks" ? "#00a1e0" : "inherit",
                    "&:hover": { backgroundColor: "#007bb5" }
                  }}
                >
                  <ListItemIcon>
                    <ImageIcon sx={{ color: pathname === "/artist-dashboard/portfolio/artworks" ? "#fff" : "#00a1e0" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Artworks"
                    primaryTypographyProps={{
                      sx: { color: pathname === "/artist-dashboard/portfolio/artworks" ? "#fff" : "#fff !important" }
                    }}
                  />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding selected={pathname === "/artist-dashboard/portfolio/awards"}>
                <ListItemButton
                  component={Link}
                  href="/artist-dashboard/portfolio/awards"
                  sx={{
                    pl: 4,
                    backgroundColor: pathname === "/artist-dashboard/portfolio/awards" ? "#00a1e0" : "inherit",
                    "&:hover": { backgroundColor: "#007bb5" }
                  }}
                >
                  <ListItemIcon>
                    <EmojiEventsIcon sx={{ color: pathname === "/artist-dashboard/portfolio/awards" ? "#fff" : "#00a1e0" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Awards"
                    primaryTypographyProps={{
                      sx: { color: pathname === "/artist-dashboard/portfolio/awards" ? "#fff" : "#fff !important" }
                    }}
                  />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding selected={pathname === "/artist-dashboard/portfolio/ratings"}>
                <ListItemButton
                  component={Link}
                  href="/artist-dashboard/portfolio/ratings"
                  sx={{
                    pl: 4,
                    backgroundColor: pathname === "/artist-dashboard/portfolio/ratings" ? "#00a1e0" : "inherit",
                    "&:hover": { backgroundColor: "#007bb5" }
                  }}
                >
                  <ListItemIcon>
                    <StarIcon sx={{ color: pathname === "/artist-dashboard/portfolio/ratings" ? "#fff" : "#00a1e0" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Ratings"
                    primaryTypographyProps={{
                      sx: { color: pathname === "/artist-dashboard/portfolio/ratings" ? "#fff" : "#fff !important" }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
          
          <ListItem disablePadding selected={pathname === "/artist-dashboard/profile"}>
            <ListItemButton
              component={Link}
              href="/artist-dashboard/profile"
              sx={{
                backgroundColor: pathname === "/artist-dashboard/profile" ? "#00a1e0" : "inherit",
                "&:hover": { backgroundColor: "#007bb5" }
              }}
            >
              <ListItemIcon>
                <AccountCircleIcon sx={{ color: pathname === "/artist-dashboard/profile" ? "#fff" : "#00a1e0" }} />
              </ListItemIcon>
              <ListItemText
                primary="Profile"
                primaryTypographyProps={{
                  sx: { color: pathname === "/artist-dashboard/profile" ? "#fff" : "#fff !important" }
                }}
              />
            </ListItemButton>          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setLogoutDialogOpen(true)}>
              <ListItemIcon>
                <LogoutIcon sx={{ color: "#00a1e0" }} />
              </ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ sx: { color: "#fff !important" } }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>      {/* Main content area */}
      <Box component="main" sx={{ flexGrow: 1, p: 2, color: "#fff", backgroundColor: "#15191c", minHeight: "100vh", position: "relative" }}>
        {children}
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to log out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="primary" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}