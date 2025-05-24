import { AppBar, Box, Button, ListItem, ListItemButton, ListItemIcon, ListItemText, List, Toolbar, Typography, useTheme, Divider, Drawer, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { styled } from "@mui/material/styles";
import Image from 'next/image';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import Link from "next/link"; // Next.js Link component (not react-router-dom)

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const LogoutButton = styled(Button)({
  backgroundColor: "#e53935",
  color: "#fff",
  fontWeight: 700,
  width: "100%",
  '&:hover': {
    backgroundColor: "#b71c1c",
  },
});

export default function Navbar() {
  const theme = useTheme();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const MenuContent = [
    { id: 1, name: "home", icon: <HomeOutlinedIcon />, path: "/" },
    { id: 2, name: "services", icon: <BuildOutlinedIcon />, path: "/#services" },
    { id: 3, name: "contact", icon: <PhoneOutlinedIcon />, path: "/contact" },
    { id: 4, name: "about", icon: <InfoOutlinedIcon />, path: "/about" },
  ];

  const ArtistMenu = [
    { id: 1, name: "dashboard", icon: <HomeOutlinedIcon />, path: "/artist-dashboard" },
    { id: 2, name: "portfolio", icon: <FolderOutlinedIcon />, path: "/artist-portfolio" },
  ];

  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/artist-login" });
    setLogoutDialogOpen(false);
  };

  const DrawerList = (
    <Box
      sx={{
        width: 250,
        backgroundColor: "#000", // Black background
        height: "100%", // Full height
        color: "#fff", // White text color
      }}
      role="presentation"
      onClick={toggleDrawer(false)} // Close drawer when clicking inside
    >
      <Box sx={{ padding: "20px" }} >
        {session ? (
          <LogoutButton
            variant="contained"
            disableRipple
            size="small"
            sx={{
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
            onClick={() => setLogoutDialogOpen(true)}
          >
            Logout
          </LogoutButton>
        ) : (
          <Link href="/artist-login" passHref style={{ width: "100%" }}>
            <Button
              variant="text"
              disableRipple
              sx={{
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <PersonOutlineOutlinedIcon sx={{ marginRight: "5px", fontSize: "25px" }} />
              Sign In
            </Button>
          </Link>
        )}
      </Box>

      <Divider sx={{ backgroundColor: "#fff" }} />

      <Box sx={{ padding: "20px" }}>
        <List>
          {(session ? ArtistMenu : MenuContent).map((menu) => (
            <ListItem key={menu.id} disablePadding>
              <Link href={menu.path} passHref style={{ textDecoration: 'none', width: '100%' }}>
                <ListItemButton
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    "&:hover .menu-text": {
                      color: "rgb(0, 161, 224)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "#fff" }}>{menu.icon}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        className="menu-text"
                        sx={{ marginLeft: "5px", color: "#ffffff" }}
                      >
                        {menu.name.toUpperCase()}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        elevation={0} // Remove shadow
        sx={{
          backgroundColor: theme.palette.appBar?.main || "#000000", // Added fallback
          paddingTop: "3px",
          paddingBottom: "3px",
          zIndex: theme.zIndex.drawer - 1,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Logo and Title */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <Box
                component="img"
                src="/OCTOTECH.svg"
                alt="Logo"
                sx={{
                  height: {
                    xs: "30px",
                    sm: "40px",
                    md: "50px",
                  },
                }}
              />
              <Typography
                variant="title"
                noWrap
                sx={{
                  fontSize: {
                    xs: "14px",
                    sm: "16px",
                    md: "20px",
                  },
                  color: "#fff",
                  marginLeft: "8px",
                }}
              >
                OCTOTECH
              </Typography>
            </Link>
          </Box>

          {/* Menu Content */}
          <Box
            component="ul"
            sx={{
              display: {
                xs: "none",
                sm: "none",
                md: "flex",
                xl: "flex",
              },
              listStyleType: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {(session ? ArtistMenu : MenuContent).map((menu) => (
              <Link href={menu.path} key={menu.id} passHref style={{ textDecoration: 'none' }}>
                <Button
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginRight: "20px",
                    "&:hover .menu-text": {
                      color: "rgb(0, 161, 224)", // Change Typography color on hover
                    },
                  }}
                  disableRipple
                >
                  {menu.icon}
                  <Typography
                    variant="body1"
                    className="menu-text"
                    sx={{
                      marginLeft: "5px",
                      color:
                        pathname === menu.path
                          ? "rgb(0, 161, 224)" // Active color
                          : "#ffffff", // Default color
                      fontWeight: pathname === menu.path ? "bold" : "normal",
                    }}
                  >
                    {menu.name.toUpperCase()}
                  </Typography>
                </Button>
              </Link>
            ))}
          </Box>

          {/* Sign In Button */}
          <Box
            sx={{
              display: {
                xs: "none", // Hide on extra-small screens
                sm: "none", // Hide on small screens
                md: "flex", // Show on medium screens
                xl: "flex", // Show on extra-large screens
              },
            }}
          >
            {session ? (
              <LogoutButton
                variant="contained"
                
                disableRipple
                onClick={() => setLogoutDialogOpen(true)}
              >
                Logout
              </LogoutButton>
            ) : (

              <>
                <Button variant="contained" size="small" >Start free now</Button>

                <Button
                  variant="text"
                  disableRipple
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "white",
                    ml: 1
                  }}
                >
                  <PersonOutlineOutlinedIcon
                    sx={{ marginRight: "5px", fontSize: "25px", color: "white" }}
                  />
                  Sign In
                </Button>
              </>
            )}
          </Box>

          {/* Hamburger Menu */}
          <Box
            sx={{
              display: {
                xs: "flex", // Show on extra-small screens
                sm: "flex", // Show on small screens
                md: "none", // Hide on medium screens
                xl: "none", // Hide on extra-large screens
              },
            }}
          >
            <Button variant="contained" size="small" >Start free now</Button>
            <Button onClick={toggleDrawer(true)}>
              <MenuIcon />
            </Button>
            <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
              {DrawerList}
            </Drawer>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Logout Confirmation Dialog */}
      <Dialog
  open={logoutDialogOpen}
  onClose={() => setLogoutDialogOpen(false)}
  PaperProps={{
    sx: {
      backgroundColor: "#15191c",
      color: "#fff",
      borderRadius: 2,
    },
  }}
>
  <DialogContent>
    <DialogContentText
      variant="h4" fontSize={20}
      sx={{ color: "#fff" }}
    >
      Are you sure you want to logout?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    
    <Button onClick={() => setLogoutDialogOpen(false)} variant="outlined">
      Cancel
    </Button>
    <Button onClick={handleLogout} color="error" variant="contained">
      Yes, Logout
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
}