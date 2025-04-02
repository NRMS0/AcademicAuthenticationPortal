import { Box, Container, Typography, Grid, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Security as SecurityIcon,
  School as SchoolIcon,
  VerifiedUser as VerifiedUserIcon,
  Lock as LockIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

const AboutPage = () => {
  const theme = useTheme();
  
  // Text style with theme support
  const textStyle = {
    fontWeight: theme.textWeights[theme.fontWeight],
    ...theme.textSizeStyles[theme.textSize],
    color: theme.palette.text.primary
  };

  // Gradient text style for headings
  const gradientTextStyle = {
    background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: theme.textWeights[theme.fontWeight],
    ...theme.textSizeStyles[theme.textSize]
  };

  // Paper style with theme support
  const paperStyle = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}`,
    boxShadow: theme.palette.mode === 'dark' 
      ? '0px 4px 20px rgba(0, 0, 0, 0.5)' 
      : '0px 4px 20px rgba(0, 0, 0, 0.1)',
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          gutterBottom 
          sx={{ 
            ...gradientTextStyle,
            fontSize: '2.5rem',
            lineHeight: 1.2
          }}
        >
          About the Student Authentication Portal
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, ...textStyle }}>
          Secure, reliable access to your academic resources
        </Typography>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, ...gradientTextStyle }}>
          Key Features
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', ...paperStyle }}>
              <List>
                {[
                  { icon: <SecurityIcon sx={{ ...gradientTextStyle }} />, text: "Secure and Safe Dashboard" },
                  { icon: <SchoolIcon sx={{ ...gradientTextStyle }} />, text: "Single sign-on for all campus services" },
                  { icon: <VerifiedUserIcon sx={{ ...gradientTextStyle }} />, text: "Multi-factor authentication options" }
                ].map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ sx: textStyle }} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', ...paperStyle }}>
              <List>
                {[
                  { icon: <LockIcon sx={{ ...gradientTextStyle }} />, text: "Role-based access control" },
                  { icon: <DashboardIcon sx={{ ...gradientTextStyle }} />, text: "Unified dashboard for all services" },
                  { icon: <AssignmentIcon sx={{ ...gradientTextStyle }} />, text: "Secure submission portal" }
                ].map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ sx: textStyle }} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Getting Started Section */}
      <Box sx={{ mt: 8 }}>
        
        <Typography variant="h4" gutterBottom sx={{ mb: 3, ...gradientTextStyle }}>
          Getting Started
        </Typography>
        <Paper sx={{ p: 3, ...paperStyle }}>
          <Typography paragraph sx={textStyle}>
            To access the portal for the first time:
          </Typography>
          <Box component="ol" sx={{ pl: 4 }}>
            <li><Typography sx={textStyle}>Use your student ID and temporary password</Typography></li>
            <li><Typography sx={textStyle}>Log in and click settings to password reset</Typography></li>
            <li><Typography sx={textStyle}>Set up multi-factor authentication</Typography></li>
            <li><Typography sx={textStyle}>Review the privacy policy</Typography></li>
          </Box>
          <Typography sx={{ mt: 2, fontStyle: 'italic', ...textStyle }}>
            Contact privacy@university.edu if you encounter any issues.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default AboutPage;