import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import TextIncreaseIcon from "@mui/icons-material/TextIncrease";
import TextDecreaseIcon from "@mui/icons-material/TextDecrease";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic"; 
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "../contexts/ThemeContext";
import SettingsIcon from "@mui/icons-material/Settings";

export default function Navbar() {
  // Accessing the theme context and navigation hook
  const theme = useTheme();
  const navigate = useNavigate();
    // manage the mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  // Check if the user is logged in by looking for a token in localStorage
  const isLoggedIn = !!localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Menu items
  const menuItems = [
    { text: "Home", link: "/" },
    !isLoggedIn && { text: "Login", link: "/login" },
    isLoggedIn && userRole === "lecturer" && { text: "Register", link: "/register" },
    isLoggedIn && {
      text: "Dashboard",
      link: userRole === "lecturer" ? "/lecturer-dashboard" : "/student-dashboard",
    },
    isLoggedIn && { text: "Logout", action: handleLogout },
  ].filter(Boolean);
  
  // Render the Navbar
  return (
    <>
      <AppBar
        position="static"
        sx={{
          background: "linear-gradient(135deg, #6a11cb, #2575fc)",
          color: "white",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ display: { xs: "block", md: "none" } }}
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Student Portal
          </Typography>

          <Box sx={{ display: { xs: "none", md: "block" } }}>
            {menuItems.map((item, index) =>
              item.action ? (
                <Button key={index} color="inherit" onClick={item.action}>
                  {item.text}
                </Button>
              ) : (
                <Button key={index} color="inherit" component={Link} to={item.link}>
                  {item.text}
                </Button>
              )
            )}
          </Box>

          {/* Font Weight Controls */}
          <IconButton 
            color="inherit" 
            onClick={theme.decreaseFontWeight}
            aria-label="Decrease font weight"
          >
            <TextDecreaseIcon /> 
          </IconButton>
          <IconButton 
            color="inherit" 
            onClick={theme.increaseFontWeight}
            aria-label="Increase font weight"
          >
            <TextIncreaseIcon />
          </IconButton>

          {/* Theme Toggle */}
          <IconButton onClick={theme.toggleTheme} color="inherit">
            {theme.darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {isLoggedIn && (
            <IconButton
              color="inherit"
              aria-label="Settings"
              onClick={() => navigate('/settings')}
            >
              <SettingsIcon />
            </IconButton>
          )}

        </Toolbar>
      </AppBar>

      {/* Mobile Drawer for smaller screens */}
      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <List sx={{ width: 250 }}>
          {menuItems.map((item, index) =>
            item.action ? (
              <ListItem button key={index} onClick={() => { item.action(); setMobileOpen(false); }}>
                <ListItemText primary={item.text} />
              </ListItem>
            ) : (
              <ListItem button key={index} component={Link} to={item.link} onClick={() => setMobileOpen(false)}>
                <ListItemText primary={item.text} />
              </ListItem>
            )
          )}
        </List>
      </Drawer>
    </>
  );
}