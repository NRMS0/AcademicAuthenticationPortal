import { Box, Typography, Container, Link, Grid, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart'; 
import { useNavigate } from 'react-router-dom'; 

export default function Footer() {
  // Hook for navigation
  const navigate = useNavigate(); 

  // Function to navigate to the System Health
  const handleSystemHealthClick = () => {
    navigate('/system-health');
  };

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #6a11cb, #2575fc)', 
        color: 'white',
        py: 3, 
        mt: 'auto', 
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="space-between">
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Student Portal
            </Typography>
            <Typography variant="body2">
              Providing great education resources for student and lecturers.
            </Typography>

            {/* System Status Icon and Text */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mt: 1, 
                cursor: 'pointer', 
              }}
              onClick={handleSystemHealthClick}
            >
              <MonitorHeartIcon sx={{ mr: 1 }} /> {/* Icon with right margin */}
              <Typography variant="body2">System Status</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Follow Us
            </Typography>
            <Box>
              <Link href="https://facebook.com" color="inherit" sx={{ mx: 1 }}>
                <FacebookIcon />
              </Link>
              <Link href="https://youtube.com/" color="inherit" sx={{ mx: 1 }}>
                <TwitterIcon />
              </Link>
              <Link href="https://instagram.com" color="inherit" sx={{ mx: 1 }}>
                <InstagramIcon />
              </Link>
            </Box>
          </Grid>
        </Grid>
        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          © {new Date().getFullYear()} Student Portal. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}