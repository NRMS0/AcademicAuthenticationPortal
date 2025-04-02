import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert
} from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';

const truncateText = (text, maxLength = 30) => {
  if (!text) return text;
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const getRandomGradient = () => {
  const colors = [
    ['#6a11cb', '#2575fc'], ['#ff9a9e', '#fad0c4'], ['#a18cd1', '#fbc2eb'],
    ['#fbc2eb', '#a6c1ee'], ['#84fab0', '#8fd3f4'], ['#ff9a9e', '#fecfef'],
    ['#a6c0fe', '#f68084'], ['#f6d365', '#fda085']
  ];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return `linear-gradient(135deg, ${colors[randomIndex][0]}, ${colors[randomIndex][1]})`;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseColors, setCourseColors] = useState({});
  const theme = useTheme();

  // Text style with theme support
  const textStyle = {
    fontWeight: theme.textWeights[theme.fontWeight],
    ...theme.textSizeStyles[theme.textSize],
    color: theme.palette.text.primary
  };

  // Paper style with theme support
  const paperStyle = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}`,
    boxShadow: theme.palette.mode === 'dark' 
      ? '0px 4px 20px rgba(0, 0, 0, 0.5)' 
      : '0px 4px 20px rgba(0, 0, 0, 0.1)',
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses/public');
        setCourses(response.data);
        
        // Generate colors for courses
        const colors = {};
        response.data.forEach(course => {
          colors[course._id] = getRandomGradient();
        });
        setCourseColors(colors);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to fetch courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
  };

  const handleCloseDialog = () => {
    setSelectedCourse(null);
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={textStyle}>
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ ...textStyle, textAlign: 'left' }}>
          Available Courses
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4, ...textStyle }}>
          Browse our catalog of courses. Click on any course to see more details.
        </Typography>

        {courses.length === 0 ? (
          <Typography variant="body1" sx={textStyle}>
            No courses available at this time.
          </Typography>
        ) : (
          <>
            <Grid container spacing={4}>
              {courses.map((course) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4}
                  lg={3}
                  key={course._id}
                >
                  <Box
                    sx={{
                      height: '250px',
                      width: '100%',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: 3,
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 5
                      }
                    }}
                    onClick={() => handleCourseClick(course)}
                  >
                    <Box
                      sx={{
                        height: '40%',
                        background: courseColors[course._id] || getRandomGradient(),
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: 'white', 
                          textAlign: 'center', 
                          mb: 2,
                          fontSize: '1.25rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          width: '100%',
                          px: 1,
                        }}
                      >
                        {truncateText(course.name)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        height: '60%',
                        backgroundColor: theme.palette.background.paper,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        p: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: theme.textWeights[theme.fontWeight],
                            color: theme.palette.text.primary,
                            fontSize: theme.textSizeStyles[theme.textSize].fontSize,
                            mb: 1
                          }}
                        >
                          {truncateText(course.name)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: theme.textSizeStyles[theme.textSize].fontSize,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {course.description || 'No description available'}
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', mt: 2 }}>
                        <Chip 
                          label={`${course.assignments?.length || 0} assignments`} 
                          size="small" 
                          sx={{ mr: 1 }} 
                        />
                        <Chip 
                          label={course.difficulty || 'Unknown level'} 
                          size="small" 
                          color="secondary" 
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Chip 
                label={`Showing ${courses.length} courses`}
                color="primary"
                sx={{ 
                  borderRadius: '16px',
                  px: 2,
                  py: 1,
                  backgroundColor: theme.palette.mode === 'dark' ? '#1976d2' : '#e3f2fd',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#1976d2'
                }}
              />
            </Box>
          </>
        )}
      </Box>

      {/* Course Details Dialog */}
      <Dialog 
        open={Boolean(selectedCourse)} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: paperStyle
        }}
      >
        {selectedCourse && (
          <>
            <DialogTitle sx={{ 
              background: courseColors[selectedCourse._id] || getRandomGradient(),
              color: 'white',
              py: 3
            }}>
              <Typography variant="h4" sx={{ fontWeight: theme.textWeights[theme.fontWeight] }}>
                {selectedCourse.name}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <DialogContentText>
                    <Typography variant="body1" paragraph sx={textStyle}>
                      {selectedCourse.description || 'No description available.'}
                    </Typography>
                    
                    {selectedCourse.learningObjectives && (
                      <>
                        <Typography variant="h6" gutterBottom sx={textStyle}>
                          Learning Objectives
                        </Typography>
                        <ul style={{ paddingLeft: '20px' }}>
                          {selectedCourse.learningObjectives.map((obj, index) => (
                            <li key={index}>
                              <Typography variant="body1" sx={textStyle}>{obj}</Typography>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </DialogContentText>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    borderRadius: 1
                  }}>
                    <Typography variant="h6" gutterBottom sx={textStyle}>
                      Course Details
                    </Typography>
                    
                    <Typography variant="body1" paragraph sx={textStyle}>
                      <strong>Difficulty:</strong> {selectedCourse.difficulty || 'Not specified'}
                    </Typography>
                    
                    <Typography variant="body1" paragraph sx={textStyle}>
                      <strong>Estimated Duration:</strong> {selectedCourse.duration || 'Not specified'}
                    </Typography>
                    
                    <Typography variant="body1" paragraph sx={textStyle}>
                      <strong>Assignments:</strong> {selectedCourse.assignments?.length || 0}
                    </Typography>
                    
                    <Typography variant="body1" sx={textStyle}>
                      <strong>Prerequisites:</strong> {selectedCourse.prerequisites?.join(', ') || 'None'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCloseDialog} sx={textStyle}>
                Close
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                sx={{
                  ...textStyle,
                  background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a0dbb, #1f67e0)',
                  }
                }}
                onClick={() => {
                  window.location.href = `/signup?course=${selectedCourse._id}`;
                }}
              >
                Enroll Now
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}