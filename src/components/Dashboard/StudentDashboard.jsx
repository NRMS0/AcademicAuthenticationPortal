import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Grow,
  Fade,
  LinearProgress,
  Alert
} from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import ViewListIcon from '@mui/icons-material/ViewList';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('StudentDashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Alert severity="error">
              Something went wrong with the dashboard. Please try refreshing.
            </Alert>
            {this.state.error && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Error: {this.state.error.message}
              </Typography>
            )}
          </Box>
        </Container>
      );
    }
    return this.props.children;
  }
}

// Safe utility functions
const truncateText = (text = '', maxLength = 30, exclude = false) => {
  if (!text || exclude) return text;
  try {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  } catch {
    return text;
  }
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

const formatGrade = (percentage) => {
  if (typeof percentage !== 'number' || isNaN(percentage)) return 'N/A';
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

// Data validation functions
const isValidCourse = (course) => {
  try {
    return Boolean(
      course?._id &&
      typeof course._id === 'string' &&
      course?.name &&
      typeof course.name === 'string'
    );
  } catch (error) {
    console.error('Invalid course structure:', error);
    return false;
  }
};

const isValidAssignment = (assignment) => {
  try {
    return Boolean(
      assignment?._id &&
      typeof assignment._id === 'string' &&
      assignment?.title &&
      typeof assignment.title === 'string' &&
      (assignment.dueDate === null || !isNaN(new Date(assignment.dueDate).getTime()))
    );
  } catch (error) {
    console.error('Invalid assignment structure:', error);
    return false;
  }
};

const isValidSubmission = (submission) => {
  try {
    return Boolean(
      submission?._id &&
      typeof submission._id === 'string' &&
      submission?.assignment &&
      isValidAssignment(submission.assignment)
    );
  } catch (error) {
    console.error('Invalid submission structure:', error);
    return false;
  }
};

const isValidGrade = (grade) => {
  try {
    return Boolean(
      grade?._id &&
      typeof grade._id === 'string' &&
      typeof grade.grade === 'number' &&
      !isNaN(grade.grade) &&
      grade.grade >= 0 &&
      grade.grade <= 100 &&
      (grade.createdAt === null || !isNaN(new Date(grade.createdAt).getTime()))
    );
  } catch (error) {
    console.error('Invalid grade structure:', error);
    return false;
  }
};

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [compactView, setCompactView] = useState(() => {
    try {
      const saved = localStorage.getItem('compactView');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [showAllCourses, setShowAllCourses] = useState(() => {
    try {
      return localStorage.getItem('showAllCourses') === 'true' || false;
    } catch {
      return false;
    }
  });
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const theme = useTheme();
  const navigate = useNavigate();

  // Safe completion calculation
  const calculateCompletion = (course) => {
    try {
      if (!isValidCourse(course)) return 0;

      const courseAssignments = Array.isArray(course.assignments)
        ? course.assignments.filter(isValidAssignment)
        : [];

      if (courseAssignments.length === 0) return 0;

      const validSubmissions = submissions.filter(isValidSubmission);

      const completedCount = courseAssignments.filter(assignment => {
        return validSubmissions.some(
          submission => submission.assignment._id === assignment._id
        );
      }).length;

      return Math.round((completedCount / courseAssignments.length) * 100);
    } catch (error) {
      console.error('Error calculating completion:', error);
      return 0;
    }
  };

  const handleCourseClick = (courseId) => {
    try {
      if (typeof courseId === 'string' && courseId.trim().length > 0) {
        navigate(`/course/${courseId}`);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const getAssignmentDueDates = () => {
    try {
      const validCourses = courses.filter(isValidCourse);
      const validSubmissions = submissions.filter(isValidSubmission);

      const dueDates = [];

      validCourses.forEach((course) => {
        const courseAssignments = Array.isArray(course.assignments)
          ? course.assignments.filter(isValidAssignment)
          : [];

        courseAssignments.forEach((assignment) => {
          const isCompleted = validSubmissions.some(
            (submission) => submission.assignment._id === assignment._id
          );

          if (!isCompleted && assignment.dueDate) {
            try {
              const dueDate = new Date(assignment.dueDate);
              if (!isNaN(dueDate.getTime())) {
                dueDates.push({
                  courseName: course.name || 'Unlisted Course',
                  dueDate,
                  title: assignment.title || 'Untitled Assignment',
                  isOverdue: dueDate < new Date(),
                });
              }
            } catch (dateError) {
              console.error('Invalid due date:', dateError);
            }
          }
        });
      });

      dueDates.sort((a, b) => a.dueDate - b.dueDate);

      return dueDates.map((assignment) => ({
        ...assignment,
        dueDate: assignment.dueDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
      }));

    } catch (error) {
      console.error('Error getting assignment due dates:', error);
      return [];
    }
  };

  // Calculate derived values with error handling
  const averageCompletion = React.useMemo(() => {
    try {
      const validCourses = courses.filter(isValidCourse);
      if (validCourses.length === 0) return 0;

      const total = validCourses.reduce((sum, course) => {
        const completion = calculateCompletion(course);
        return sum + (isNaN(completion) ? 0 : completion);
      }, 0);

      return Math.round(total / validCourses.length);
    } catch (error) {
      console.error('Error calculating average completion:', error);
      return 0;
    }
  }, [courses, submissions]);

  const averageGrade = React.useMemo(() => {
    try {
      const validGrades = grades.filter(isValidGrade);
      if (validGrades.length === 0) return 0;

      const total = validGrades.reduce((sum, grade) => sum + (isNaN(grade.grade) ? 0 : grade.grade), 0);
      return Math.round(total / validGrades.length);
    } catch (error) {
      console.error('Error calculating average grade:', error);
      return 0;
    }
  }, [grades]);

  const loadCourseColors = () => {
    try {
      const colors = localStorage.getItem('courseColors');
      return colors ? JSON.parse(colors) : {};
    } catch (error) {
      console.error('Error loading course colors:', error);
      return {};
    }
  };

  const [courseColors, setCourseColors] = useState(loadCourseColors);

  const coursesPerView = compactView ? 8 : 6;
  const validCourses = courses.filter(isValidCourse);
  const displayedCourses = showAllCourses
    ? validCourses
    : validCourses.slice(0, coursesPerView);

  const hiddenCoursesCount = showAllCourses
    ? 0
    : Math.max(0, validCourses.length - coursesPerView);

  useEffect(() => {
    try {
      localStorage.setItem('compactView', compactView);
      localStorage.setItem('showAllCourses', showAllCourses);
    } catch (error) {
      console.error('Error saving view preferences:', error);
    }
  }, [compactView, showAllCourses]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [coursesResponse, submissionsResponse, gradesResponse] = await Promise.all([
          api.get('/courses/student'),
          api.get('/submissions/student'),
          api.get('/grades/student/grades')
        ]);

        if (!isMounted) return;

        // Validate and set data
        const validCourses = Array.isArray(coursesResponse?.data)
          ? coursesResponse.data.filter(isValidCourse)
          : [];

        const validSubmissions = Array.isArray(submissionsResponse?.data)
          ? submissionsResponse.data.filter(isValidSubmission)
          : [];

        const validGrades = Array.isArray(gradesResponse?.data)
          ? gradesResponse.data.filter(isValidGrade)
          : [];

        if (isMounted) {
          setCourses(validCourses);
          setSubmissions(validSubmissions);
          setGrades(validGrades);

          // Update course colors
          const updatedColors = { ...courseColors };
          validCourses.forEach((course) => {
            if (!updatedColors[course._id]) {
              updatedColors[course._id] = getRandomGradient();
            }
          });

          try {
            localStorage.setItem('courseColors', JSON.stringify(updatedColors));
            setCourseColors(updatedColors);
          } catch (error) {
            console.error('Error saving course colors:', error);
          }
        }

      } catch (error) {
        if (isMounted) {
          console.error('Error fetching data:', error);
          setError(error.message || 'Failed to fetch data. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

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
          <Alert severity="error">
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  const assignments = getAssignmentDueDates();
  const notifications = [
    { id: 1, message: 'New assignment posted for Mathematics', date: '10/10/2023' },
    { id: 2, message: 'Grade updated for Science', date: '09/10/2023' },
  ];

  return (
    <ErrorBoundary>
      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ 
            textAlign: 'left',
            color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
          }}>
            Welcome to Your Dashboard
          </Typography>

          {/* Stats Bar with Average Progress and Grade */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <Box sx={{
              display: 'flex',
              gap: 2,
              flexGrow: 1,
              flexWrap: 'wrap'
            }}>
              {/* Average Progress */}
              <Box sx={{
                flex: 1,
                minWidth: 250,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                p: 1.5,
                borderRadius: 1,
                boxShadow: 1,
                color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
              }}>
                <Box sx={{ minWidth: 100 }}>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 'bold',
                    color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                  }}>
                    Avg. Progress
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: theme.palette.mode === 'dark' ? '#e0e0e0' : 'text.secondary'
                  }}>
                    {averageCompletion}% Complete
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={averageCompletion}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    flexGrow: 1,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      backgroundColor: theme.palette.mode === 'dark' ? '#4caf50' : '#2e7d32'
                    }
                  }}
                />
              </Box>

              {/* Average Grade */}
              <Box sx={{
                flex: 1,
                minWidth: 250,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                p: 1.5,
                borderRadius: 1,
                boxShadow: 1,
                color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
              }}>
                <Box sx={{ minWidth: 100 }}>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 'bold',
                    color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                  }}>
                    Avg. Grade
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: theme.palette.mode === 'dark' ? '#e0e0e0' : 'text.secondary'
                  }}>
                    {formatGrade(averageGrade)} ({averageGrade}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={averageGrade}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    flexGrow: 1,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      backgroundColor: theme.palette.mode === 'dark' ? '#1976d2' : '#1565c0'
                    }
                  }}
                />
              </Box>
            </Box>

            {/* View Toggle Buttons */}
            <Box sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center'
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Grow in={showAllCourses} timeout={300}>
                  <Fade in={showAllCourses} timeout={300}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.mode === 'dark' ? '#ffffff' : 'text.primary',
                        fontStyle: 'italic'
                      }}
                    >
                      Showing all courses
                    </Typography>
                  </Fade>
                </Grow>
                <Tooltip title={showAllCourses ? "Show limited courses" : "Show all courses"}>
                  <IconButton
                    onClick={() => setShowAllCourses(!showAllCourses)}
                    color={showAllCourses ? "primary" : "default"}
                    sx={{ 
                      color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <ViewListIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Tooltip title={compactView ? "Normal view" : "Compact view"}>
                <IconButton
                  onClick={() => setCompactView(!compactView)}
                  color={compactView ? "primary" : "default"}
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  {compactView ? <ViewComfyIcon /> : <ViewCompactIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Courses Grid */}
          <Typography variant="h5" gutterBottom sx={{ 
            textAlign: 'left', 
            mt: 2,
            color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
          }}>
            Your Courses
          </Typography>

          {validCourses.length === 0 ? (
            <Typography variant="body1" sx={{ color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit' }}>
              No courses found.
            </Typography>
          ) : (
            <>
              <Grid container spacing={compactView ? 2 : 4}>
                {displayedCourses.map((course) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={compactView ? 3 : 4}
                    key={course._id}
                    sx={{
                      transition: 'transform 0.15s ease',
                      transform: hoveredCourse === course._id ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    <Box
                      tabIndex={0}
                      role="button"
                      aria-label={`View ${course.name} course details`}
                      sx={{
                        height: compactView ? '180px' : '200px',
                        width: '100%',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: hoveredCourse === course._id
                          ? '0px 5px 15px rgba(0, 0, 0, 0.2)'
                          : '0px 2px 10px rgba(0, 0, 0, 0.1)',
                        '&:focus': {
                          outline: 'none',
                          transform: 'scale(1.05)',
                          boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.5)'
                        },
                        '&:focus-visible': {
                          outline: 'none',
                          boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.5)'
                        }
                      }}
                      onClick={() => handleCourseClick(course._id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCourseClick(course._id);
                        }
                      }}
                      onMouseEnter={() => setHoveredCourse(course._id)}
                      onMouseLeave={() => setHoveredCourse(null)}
                    >
                      <Box
                        sx={{
                          height: compactView ? '55%' : '40%',
                          background: courseColors[course._id] || getRandomGradient(),
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: compactView ? 1 : 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            color: 'white',
                            textAlign: 'center',
                            mb: compactView ? 1 : 2,
                            fontSize: compactView ? '1rem' : '1.25rem',
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
                          height: compactView ? '50%' : '60%',
                          backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          p: compactView ? 1 : 2,
                        }}
                      >
                        <Box sx={{ mt: compactView ? 0.5 : 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 'bold',
                              color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                              fontSize: compactView ? '0.875rem' : '1rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '150px',
                            }}
                          >
                            {truncateText(course.name)}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#666666',
                              fontSize: compactView ? '0.65rem' : '0.75rem',
                              display: 'block',
                              lineHeight: 1.2,
                              mt: 0.5,
                            }}
                          >
                            ID: {course._id?.substring?.(0, 8) || 'N/A'}...
                          </Typography>
                        </Box>
                        <Box sx={{
                          position: 'relative',
                          width: compactView ? '50px' : '60px',
                          height: compactView ? '50px' : '60px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mt: compactView ? 0.5 : 1,
                        }}>
                          <svg
                            width={compactView ? '50px' : '60px'}
                            height={compactView ? '50px' : '60px'}
                            viewBox="0 0 42 42"
                            style={{ position: 'absolute', transform: 'rotate(120deg)' }}
                          >
                            <circle
                              cx="21"
                              cy="21"
                              r="15.915"
                              fill="transparent"
                              stroke={theme.palette.mode === 'dark' ? '#333333' : '#e0e0e0'}
                              strokeWidth="6"
                              strokeDasharray="83.33, 100"
                              strokeDashoffset="25"
                              strokeLinecap="round"
                            />
                            <circle
                              cx="21"
                              cy="21"
                              r="15.915"
                              fill="transparent"
                              stroke={calculateCompletion(course) === 0 ? '#9e9e9e' : '#4caf50'}
                              strokeWidth="6"
                              strokeDasharray={`${calculateCompletion(course) * 0.8333}, 100`}
                              strokeDashoffset="25"
                              strokeLinecap="round"
                            />
                          </svg>
                          <Typography
                            variant="body2"
                            sx={{
                              position: 'relative',
                              color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                              fontWeight: 'bold',
                              fontSize: compactView ? '0.70rem' : '0.78rem'
                            }}
                          >
                            {calculateCompletion(course)}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                {hiddenCoursesCount > 0 ? (
                  <Chip
                    label={`${hiddenCoursesCount} ${hiddenCoursesCount === 1 ? 'course is' : 'courses are'} hidden`}
                    color="primary"
                    variant="outlined"
                    sx={{ 
                      borderRadius: '16px', 
                      px: 2, 
                      py: 1,
                      color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                    }}
                  />
                ) : (
                  <Chip
                    label={`Showing all ${validCourses.length} courses`}
                    color="primary"
                    sx={{
                      borderRadius: '16px',
                      px: 2,
                      py: 1,
                      backgroundColor: theme.palette.mode === 'dark' ? '#1976d2' : '#e3f2fd',
                      color: theme.palette.mode === 'dark' ? '#fff' : '#1976d2'
                    }}
                  />
                )}
              </Box>
            </>
          )}

          {/* Assignment Due Dates, Notifications, and Grades Sections */}
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom sx={{ 
                textAlign: 'left',
                color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
              }}>
                Assignment Due Dates
              </Typography>
              <Box
                sx={{
                  height: '300px',
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#555' : '#ccc',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#888' : '#aaa',
                  },
                }}
              >
                <Grid container spacing={2}>
                  {assignments.length > 0 ? (
                    assignments.map((assignment, index) => (
                      <Grid item xs={12} key={index}>
                        <Box
                          sx={{
                            p: 2,
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            backgroundColor: theme.palette.background.paper,
                            borderColor: assignment.isOverdue ? 'red' : '#ddd',
                            color: assignment.isOverdue ? 'red' : theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                          }}
                        >
                          <Typography variant="body1" sx={{ 
                            fontWeight: 'bold',
                            color: assignment.isOverdue ? 'red' : theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                          }}>
                            {truncateText(assignment.courseName)}
                          </Typography>
                          <Typography variant="body2" sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: assignment.isOverdue ? 'red' : theme.palette.mode === 'dark' ? '#e0e0e0' : 'inherit'
                          }}>
                            {truncateText(assignment.title)} - Due: {assignment.dueDate}
                          </Typography>
                        </Box>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 2,
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          backgroundColor: theme.palette.background.paper,
                          textAlign: 'center',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          All up to date ✅
                        </Typography>
                        <Typography variant="body2">You can rest easy</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="h5" gutterBottom sx={{ 
                textAlign: 'left',
                color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
              }}>
                Notifications
              </Typography>
              <Box
                sx={{
                  height: '300px',
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#555' : '#ccc',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#888' : '#aaa',
                  },
                }}
              >
                <Grid container spacing={2}>
                  {notifications.map((notification) => (
                    <Grid item xs={12} key={notification.id}>
                      <Box
                        sx={{
                          p: 2,
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          backgroundColor: theme.palette.background.paper,
                          color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                        }}
                      >
                        <Typography variant="body1" sx={{
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                        }}>
                          {truncateText(notification.message)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? '#e0e0e0' : 'inherit' }}>
                          {notification.date}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="h5" gutterBottom sx={{ 
                textAlign: 'left',
                color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
              }}>
                Your Grades
              </Typography>
              <Box
                sx={{
                  height: '300px',
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#555' : '#ccc',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#888' : '#aaa',
                  },
                }}
              >
                {grades.length > 0 ? (
                  grades.map((grade) => (
                    <Box
                      key={grade._id}
                      sx={{
                        p: 2,
                        mb: 1,
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                      }}
                    >
                      <Typography variant="body1" sx={{
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                      }}>
                        {truncateText(grade.assignment?.title || 'Unlisted Assignment')}: {formatGrade(grade.grade)} ({grade.grade}%)
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? '#e0e0e0' : 'inherit' }}>
                        Graded on: {grade.createdAt ? new Date(grade.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                      </Typography>
                      {grade.feedback && (
                        <Typography variant="body2" sx={{ 
                          mt: 1, 
                          fontStyle: 'italic',
                          color: theme.palette.mode === 'dark' ? '#e0e0e0' : 'inherit'
                        }}>
                          Feedback: {truncateText(grade.feedback, 40)}
                        </Typography>
                      )}
                    </Box>
                  ))
                ) : (
                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      backgroundColor: theme.palette.background.paper,
                      textAlign: 'center',
                      color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                    }}
                  >
                    <Typography variant="body1">
                      No grades available yet
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ErrorBoundary>
  );
};

export default StudentDashboard;