import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Grid, Paper, IconButton } from '@mui/material';
import { KeyboardNavigationProvider, KeyboardNavContext } from './KeyboardNavigationProvider';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { useTheme } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import LecturerDashboard from './components/Dashboard/LecturerDashboard';
import CourseDetails from './components/Course/CourseDetails';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Footer from './components/Footer';
import SystemHealthPage from "./components/SystemHealthPage";
import NewsFeed from './components/NewsFeed';
import EventsFeed from './components/EventsFeed';
import CoursesPage from './components/CoursesPage';
import AboutPage from './components/About/AboutPage';
import TwoFALoginPage from './components/TwoFALoginPage';
import SettingsPage from './components/settingsPage';
import Verify2FA from './components/Verify2FA';
import Policy from './components/Policy/Policy';
import EmojiBackground from './components/EmojiBackground';

function App() {
  // Get current theme 
  const theme = useTheme();

  return (
    <KeyboardNavigationProvider>
      <AppContent theme={theme} />
    </KeyboardNavigationProvider>
  );
}

// Main application content wrapped in context
function AppContent({ theme }) {
  const { navEnabled, setNavEnabled } = useContext(KeyboardNavContext);
  const location = useLocation();
  const navigate = useNavigate();

// Extract theme-based colors
  const getThemeColor = () => ({
    primaryMain: theme?.palette?.primary?.main || '#1976d2',
    primaryDark: theme?.palette?.primary?.dark || '#1565c0',
    actionHover: theme?.palette?.action?.hover || 'rgba(0, 0, 0, 0.04)',
    actionSelected: theme?.palette?.action?.selected || 'rgba(0, 0, 0, 0.08)',
    textPrimary: theme?.palette?.text?.primary || 'rgba(0, 0, 0, 0.87)'
  });

  const colors = getThemeColor();

  // Focus interactive element if keyboard navigation is enabled
  useEffect(() => {
    if (navEnabled) {
      setTimeout(() => {
        const firstFocusable = document.querySelector(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus({ preventScroll: true });
      }, 100);
    }
  }, [location.pathname, navEnabled]);

  return (
    <Box sx={{
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: theme?.palette?.background?.default || '#ffffff'
    }}>
      <IconButton
        onClick={() => setNavEnabled(!navEnabled)}
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          zIndex: 1000,
          backgroundColor: navEnabled ? colors.primaryMain : colors.actionHover,
          color: navEnabled ? '#fff' : colors.textPrimary,
          '&:hover': {
            backgroundColor: navEnabled ? colors.primaryDark : colors.actionSelected
          }
        }}
        aria-label={navEnabled ? "Disable keyboard navigation" : "Enable keyboard navigation"}
      >
        <KeyboardIcon />
      </IconButton>

      <EmojiBackground />

      <Box sx={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(42, 42, 42, 0.85)'
          : 'rgba(255, 255, 255, 0.85)',
      }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, pb: 6 }}>
          <Routes>
            <Route path="/" element={<Home navigate={navigate} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/2fa" element={<TwoFALoginPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/policy" element={<Policy />} />
            <Route path="/verify-2fa" element={<Verify2FA />} />
            <Route
              path="/register"
              element={
                <ProtectedRoute roleRequired="lecturer">
                  <Register />
                </ProtectedRoute>
              }
            />
            <Route path="/system-health" element={<SystemHealthPage />} />
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lecturer-dashboard"
              element={
                <ProtectedRoute>
                  <LecturerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/:courseId"
              element={
                <ProtectedRoute>
                  <CourseDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/unauthorized"
              element={
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={theme.textWeights[theme.fontWeight]}>
                    403 - Access Denied
                  </Typography>
                  <Typography fontWeight={theme.textWeights[theme.fontWeight]}>
                    You do not have permission to view this page.
                  </Typography>
                </Box>
              }
            />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}

function Home({ navigate }) {
  const theme = useTheme();
    // Carousel configuration
  const carouselSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
  };

  //carousel items using copyright free images
  const carouselItems = [
    {
      image: "https://plus.unsplash.com/premium_photo-1683887034473-74e486cdb7a1?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      text: "Join our webinar on Machine Learning!",
    },
    {
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      text: "Register for the annual coding competition!",
    },
    {
      image: "https://images.unsplash.com/20/cambridge.JPG?q=80&w=2047&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      text: "Explore new courses and enhance your skills!",
    },
  ];

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ width: '100%', margin: 0, padding: 0 }}>
        <Slider {...carouselSettings}>
          {carouselItems.map((item, index) => (
            <Box key={index} sx={{ position: 'relative', textAlign: 'center' }}>
              <img
                src={item.image}
                alt={`Event ${index + 1}`}
                style={{ 
                  width: '100%', 
                  height: '500px', 
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '20%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.42)', 
                  color: 'white',
                  px: 3, 
                  py: 2, 
                  borderRadius: 10, 
                  border: 'none', 
                  boxShadow: 'none',
                  maxWidth: '80%', 
                  textAlign: 'center'
                }}
              >
                <Typography
                  variant="h4"
                  fontWeight={theme.textWeights[theme.fontWeight]}
                  sx={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.5)', 
                    lineHeight: 1.2
                  }}
                >
                  {item.text}
                </Typography>
              </Box>
            </Box>
          ))}
        </Slider>
      </Box>

      <Container sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.4 }}>
              <Button
                onClick={() => navigate('/about')}
                variant="contained"
                sx={{
                  m: 1,
                  width: '100%',
                  height: '65px',
                  background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
                  color: 'white',
                  '&:hover': { background: 'linear-gradient(135deg, #5a0dbb, #1f67e0)' },
                  fontWeight: theme.textWeights[theme.fontWeight]
                }}
              >
                About
              </Button>
              <Button
                onClick={() => navigate('/about')}
                variant="contained"
                sx={{
                  m: 1,
                  width: '100%',
                  height: '65px',
                  background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
                  color: 'white',
                  '&:hover': { background: 'linear-gradient(135deg, #5a0dbb, #1f67e0)' },
                  fontWeight: theme.textWeights[theme.fontWeight]
                }}
              >
                Support
              </Button>
              <Button
                onClick={() => navigate('/courses')}
                variant="contained"
                sx={{
                  m: 1,
                  width: '100%',
                  height: '65px',
                  background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
                  color: 'white',
                  '&:hover': { background: 'linear-gradient(135deg, #5a0dbb, #1f67e0)' },
                  fontWeight: theme.textWeights[theme.fontWeight]
                }}
              >
                Courses
              </Button>
              <Button
                onClick={() => navigate('/courses')}
                variant="contained"
                sx={{
                  m: 1,
                  width: '100%',
                  height: '65px',
                  background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
                  color: 'white',
                  '&:hover': { background: 'linear-gradient(135deg, #5a0dbb, #1f67e0)' },
                  fontWeight: theme.textWeights[theme.fontWeight]
                }}
              >
                Apply
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={10}>
            <Grid container spacing={6}>
              <Grid item xs={12} md={6}>
                <Paper sx={{
                  width: '100%',
                  height: '300px',
                  overflowY: 'scroll',
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' },
                  msOverflowStyle: 'none',
                  boxShadow: theme.palette.mode === 'dark' ? '0px 4px 20px rgba(0, 0, 0, 0.5)' : '0px 4px 20px rgba(0, 0, 0, 0.1)',
                  border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}`
                }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    fontWeight={theme.textWeights[theme.fontWeight]}
                    sx={{ color: theme.palette.text.primary }}
                  >
                    Recent News
                  </Typography>
                  <NewsFeed />
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{
                  width: '100%',
                  height: '300px',
                  overflowY: 'scroll',
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' },
                  msOverflowStyle: 'none',
                  boxShadow: theme.palette.mode === 'dark' ? '0px 4px 20px rgba(0, 0, 0, 0.5)' : '0px 4px 20px rgba(0, 0, 0, 0.1)',
                  border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}`
                }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    fontWeight={theme.textWeights[theme.fontWeight]}
                    sx={{ color: theme.palette.text.primary }}
                  >
                    Current Events
                  </Typography>
                  <EventsFeed />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default App;