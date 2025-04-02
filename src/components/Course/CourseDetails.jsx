import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Avatar,
  Paper,
  Grid,
  Badge,
  IconButton,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import api from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { useDropzone } from 'react-dropzone';


// Dummy data for assessments and course content
const DUMMY_ASSESSMENTS = [
  { _id: 1, title: 'Midterm Exam', date: '2023-11-15', status: 'Upcoming' },
  { _id: 2, title: 'Final Exam', date: '2023-12-20', status: 'Upcoming' },
];

const DUMMY_COURSE_CONTENT = [
  {
    _id: 1,
    week: 1,
    title: 'Introduction to React',
    discussion: 'Getting started with React basics',
    files: [{ name: 'Lecture1.pdf', url: '/files/lecture1.pdf' }]
  },
  {
    _id: 2,
    week: 2,
    title: 'State and Props',
    discussion: 'Understanding state and props in React',
    files: [{ name: 'Lecture2.pdf', url: '/files/lecture2.pdf' }]
  },
];

const ACHIEVEMENT_CONFIG = {
  "High Achiever": {
    emoji: "🌟",
    color: "#FFD700", // Gold
    bgColor: "rgba(255, 215, 0, 0.2)"
  },
  "Punctual": {
    emoji: "⏰",
    color: "#4CAF50", // Green
    bgColor: "rgba(76, 175, 80, 0.2)"
  },
  "Perfect Score": {
    emoji: "💯",
    color: "#9C27B0", // Purple
    bgColor: "rgba(156, 39, 176, 0.2)"
  },
  "default": {
    emoji: "🏆",
    color: "#2196F3", // Blue
    bgColor: "rgba(33, 150, 243, 0.2)"
  }
};

const getAchievementConfig = (achievementText) => {
  if (achievementText.includes("High Achiever")) return ACHIEVEMENT_CONFIG["High Achiever"];
  if (achievementText.includes("Punctual")) return ACHIEVEMENT_CONFIG["Punctual"];
  if (achievementText.includes("Perfect Score")) return ACHIEVEMENT_CONFIG["Perfect Score"];
  return ACHIEVEMENT_CONFIG["default"];
};

export default function CourseDetails() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [grades, setGrades] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [assessments, setAssessments] = useState(DUMMY_ASSESSMENTS);
  const [courseContent, setCourseContent] = useState(DUMMY_COURSE_CONTENT);
  const theme = useTheme();
  const boldHeadings = theme.bold?.headings || false;
  const boldBodyText = theme.bold?.body || false;
  const [files, setFiles] = useState([]);
  const [submissionComplete, setSubmissionComplete] = useState(false);

  // Safe theme accessors with fallbacks
  const getBackgroundColor = () => theme.palette?.background?.paper || (theme.palette?.mode === 'dark' ? '#121212' : '#ffffff');
  const getTextColor = (type = 'primary') => theme.palette?.text?.[type] || (type === 'primary' ? (theme.palette?.mode === 'dark' ? '#fff' : '#000') : '#b0b0b0');
  const getGreyColor = (shade) => theme.palette?.grey?.[shade] || 
    ({ 800: '#424242', 700: '#616161', 300: '#e0e0e0', 200: '#f5f5f5' }[shade]);
  const getDividerColor = () => theme.palette?.divider || (theme.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)');
  const getPrimaryColor = () => theme.palette?.primary?.main || '#1976d2';

  const calculateDaysLeft = (dueDate) => {
    if (!dueDate) return "No due date";
    const today = new Date();
    const due = new Date(dueDate);
    const difference = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return difference > 0 ? `${difference} days left` : "Past due!";
  };

  const generateAchievements = (grades, submissions) => {
    if (!grades.length || !submissions.length) {
      return ["No grades available yet to calculate achievements"];
    }
  
    const achievements = [];
  
    // Achievement for high grades
    const highGrades = grades.filter(g => g.grade >= 90);
    if (highGrades.length > 0) {
      achievements.push(`High Achiever: ${highGrades.length} grade(s) above 90!`);
    }
  
    // Achievement for perfect scores
    const perfectScores = grades.filter(g => g.grade === 100);
    if (perfectScores.length > 0) {
      achievements.push(`Perfect Score: ${perfectScores.length} assignment(s) with 100%!`);
    }
  
    // Achievement for on-time submissions
    const onTimeSubmissions = submissions.filter(sub => {
      try {
        if (!sub.submittedAt || !sub.assignment || !sub.assignment.dueDate) return false;
        const submittedDate = new Date(sub.submittedAt);
        const dueDate = new Date(sub.assignment.dueDate);
        if (isNaN(dueDate)) return false;
        dueDate.setHours(23, 59, 59, 999);
        return submittedDate <= dueDate;
      } catch (e) {
        console.error('Error evaluating punctuality:', e);
        return false;
      }
    });
  
    if (onTimeSubmissions.length > 0) {
      achievements.push(`Punctual: ${onTimeSubmissions.length} assignment(s) submitted on time!`);
    }
  
    if (!achievements.length) {
      achievements.push("Keep going! Complete assignments to earn achievements");
    }
  
    return achievements;
  };

  
  const fetchCourseData = async () => {
    try {
      const courseResponse = await api.get(`/courses/${courseId}`);
      setCourse(courseResponse.data);
  
      const submissionsResponse = await api.get('/submissions/student?populate=assignment,gradeDetails');
      console.log("🧪 All fetched submissions:", submissionsResponse.data);
  
      // Filter submissions to only this course
      const filteredSubmissions = submissionsRes.data.filter(s =>
        s.assignment &&
        (s.assignment.course?._id?.toString() === courseId || s.assignment.course?.toString() === courseId)
      );
      
      setStudentSubmissions(studentSubmissions);
  
      // Extract gradeDetails from the submissions that have them
      const courseGrades = studentSubmissions
        .map(s => s.gradeDetails)
        .filter(Boolean); 
  
      setGrades(courseGrades);
      setAchievements(generateAchievements(courseGrades, studentSubmissions));
  
      console.log(" Submissions with grades:", studentSubmissions);
      console.log(" Extracted grades:", courseGrades);
    } catch (error) {
      console.error("Error fetching course data:", error);
      setError(`Failed to load course data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  //fetch submissions
  const fetchSubmissions = async (assignmentId) => {
    try {
      const response = await api.get(`/submissions/assignment/${assignmentId}`);
      setSubmissions(response.data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: submissionComplete,
  });

  const handleSubmitAssignment = async (assignmentId) => {
    if (!files.length) {
      alert('Please select files before submitting.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('assignmentId', assignmentId);

    try {
      const response = await api.post('/submissions/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Upload response:', response.data);

      setStudentSubmissions((prev) => [...prev, response.data.submission]);
      setCourse((prev) => ({
        ...prev,
        assignments: prev.assignments.map((a) =>
          a._id === assignmentId ? { ...a, submitted: true } : a
        ),
      }));

      setSubmissionComplete(true);
      setTimeout(() => window.location.reload(), 500); // Refreshes page shortly after submission
    } catch (error) {
      console.error(' Error submitting assignment:', error);
      alert('Upload failed. See console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleOpenAssignmentDetails = (assignment) => {
    setSelectedAssignment(assignment);
  
    // Ensure you're using student-specific submissions
    const studentSpecificSubmission = studentSubmissions.filter(
      (submission) => submission.assignment._id === assignment._id
    );
  
    setSubmissions(studentSpecificSubmission);
  };

  const handleCloseAssignmentDetails = () => {
    setSelectedAssignment(null);
  };

  const getLetterGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
  
        const [courseRes, submissionsRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get('/submissions/student?populate=assignment,gradeDetails')
        ]);

        const isMatchingCourse = (assignment) => {
          const course = assignment?.course;
          if (!course) return false;
          return (typeof course === 'string' ? course : course._id)?.toString() === courseId;
        };
  
        const filteredSubmissions = submissionsRes.data.filter(
          s => isMatchingCourse(s.assignment)
        );
  
        const extractedGrades = filteredSubmissions
          .map(s => s.gradeDetails)
          .filter(Boolean);
  
        setCourse(courseRes.data);
        setStudentSubmissions(filteredSubmissions);
        setGrades(extractedGrades);
  
        const generatedAchievements = generateAchievements(extractedGrades, filteredSubmissions);
        setAchievements(generatedAchievements);
  
        console.log(' Submissions loaded:', filteredSubmissions);
        console.log(' Grades extracted:', extractedGrades);
      } catch (err) {
        console.error(" Failed to load course data:", err);
        setError(err.response?.data?.message || 'Failed to load course data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [courseId]);
  
  

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
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header with Course Title and Achievements */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ color: getTextColor() }}>
          {course?.name || 'Course Details'}
        </Typography>
        <Box>
          <Tooltip title="Achievements">
            <IconButton>
              <Badge badgeContent={achievements.length} color="primary">
                <EmojiEventsIcon fontSize="large" sx={{ color: getTextColor() }} />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Achievements Section */}
      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Typography variant="h6" sx={{ color: getTextColor() }}>Achievements</Typography>
        {achievements.length > 0 ? (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {achievements.map((achievement, index) => {
              const config = getAchievementConfig(achievement);
              return (
                <Tooltip key={index} title={achievement}>
                  <Avatar sx={{
                    bgcolor: config.bgColor,
                    color: config.color,
                    width: 36,
                    height: 36,
                    fontSize: '1.2rem',
                    border: `2px solid ${config.color}`,
                  }}>
                    {config.emoji}
                  </Avatar>
                </Tooltip>
              );
            })}
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" sx={{ textAlign: 'right', color: getTextColor('secondary') }}>
              {grades.length > 0 ?
                "Complete more assignments to earn achievements!" :
                "No grades available yet to calculate achievements"}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Grades Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ color: getTextColor() }}>
          Grades
        </Typography>
        <Paper elevation={3} sx={{ 
          p: 2,
          backgroundColor: getBackgroundColor(),
          border: `1px solid ${getDividerColor()}`
        }}>
          {studentSubmissions.filter(s => {
            const courseRef = s.assignment?.course;
            return (courseRef === courseId || courseRef?._id === courseId) && s.gradeDetails;
          }).length === 0 ? (
            <Typography variant="body1" sx={{ color: getTextColor() }}>No grades available yet</Typography>
          ) : (
            <List>
                {studentSubmissions
                  .filter(s => {
                    const courseRef = s.assignment?.course;
                    return (courseRef === courseId || courseRef?._id === courseId) && s.gradeDetails;
                  })
                  .map((submission) => {
                  const grade = submission.gradeDetails;
                  const letterGrade = grade ? getLetterGrade(grade.grade) : 'N/A';
                  return (
                    <ListItem key={submission._id}>
                      <ListItemText
                        primary={<Typography sx={{ color: getTextColor() }}>{submission.assignment.title}</Typography>}
                        secondary={<Typography sx={{ color: getTextColor('secondary') }}>
                          {grade ? `${grade.grade}% (${letterGrade}) - ${grade.feedback || 'No feedback'}` : 'Not graded yet'}
                        </Typography>}
                      />
                      {grade && (
                        <Avatar
                          sx={{
                            bgcolor:
                              grade.grade >= 90 ? '#FFD700' :
                                grade.grade >= 80 ? '#C0C0C0' :
                                  grade.grade >= 70 ? '#CD7F32' : '#f44336',
                          }}
                        >
                          {letterGrade}
                        </Avatar>
                      )}
                    </ListItem>
                  );
                })}
            </List>
          )}
        </Paper>
      </Box>

      {/* Assessments Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ color: getTextColor() }}>
          Assessments
        </Typography>
        <Paper elevation={3} sx={{ 
          p: 2,
          backgroundColor: getBackgroundColor(),
          border: `1px solid ${getDividerColor()}`
        }}>
          <List>
            {assessments.map((assessment) => (
              <ListItem key={assessment._id}>
                <ListItemText
                  primary={<Typography sx={{ color: getTextColor() }}>{assessment.title}</Typography>}
                  secondary={<Typography sx={{ color: getTextColor('secondary') }}>
                    Date: {new Date(assessment.date).toLocaleDateString()} - Status: {assessment.status}
                  </Typography>}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      {/* Course Content Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ color: getTextColor() }}>
          Course Content
        </Typography>
        <Paper elevation={3} sx={{ 
          backgroundColor: getBackgroundColor(),
          border: `1px solid ${getDividerColor()}`
        }}>
          {courseContent.map((week) => (
            <Accordion key={week._id} elevation={1} sx={{ 
              backgroundColor: getBackgroundColor(),
              border: `1px solid ${getDividerColor()}`,
              '&:before': {
                display: 'none'
              }
            }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: getTextColor() }} />}>
                <Typography variant="h6" sx={{ color: getTextColor() }}>Week {week.week}: {week.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ color: getTextColor() }}>{week.discussion}</Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: getTextColor() }}>Files:</Typography>
                  <Grid container spacing={1}>
                    {week.files.map((file, index) => (
                      <Grid item key={index}>
                        <Chip
                          avatar={
                            <Avatar sx={{ 
                              backgroundColor: getPrimaryColor(),
                              color: theme.palette?.primary?.contrastText || '#fff'
                            }}>
                              <DescriptionIcon />
                            </Avatar>
                          }
                          label={file.name}
                          onClick={() => window.open(file.url, '_blank')}
                          sx={{
                            color: getTextColor(),
                            backgroundColor: theme.palette?.mode === 'dark' 
                              ? getGreyColor(800) 
                              : getGreyColor(200),
                            '&:hover': {
                              backgroundColor: theme.palette?.mode === 'dark' 
                                ? getGreyColor(700) 
                                : getGreyColor(300),
                            }
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      </Box>

      {/* Assignments Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ color: getTextColor() }}>
          Assignments
        </Typography>
        {course?.assignments?.length === 0 ? (
          <Typography variant="body1" sx={{ color: getTextColor() }}>No assignments found.</Typography>
        ) : (
          <Paper elevation={3} sx={{ 
            p: 2,
            backgroundColor: getBackgroundColor(),
            border: `1px solid ${getDividerColor()}`
          }}>
            <List>
              {course?.assignments?.map((assignment) => {
                const submission = studentSubmissions.find(s =>
                  s.assignment._id === assignment._id
                );
                return (
                  <ListItem
                    key={assignment._id}
                    button
                    onClick={() => handleOpenAssignmentDetails(assignment)}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette?.action?.hover || 'rgba(255, 255, 255, 0.08)',
                      }
                    }}
                  >
                    <ListItemText
                      primary={<Typography sx={{ color: getTextColor() }}>{assignment.title}</Typography>}
                      secondary={<Typography sx={{ color: getTextColor('secondary') }}>{calculateDaysLeft(assignment.dueDate)}</Typography>}
                    />
                    {submission ? (
                      <Chip
                        label={`Submitted - ${submission.gradeDetails ?
                          `Grade: ${submission.gradeDetails.grade}` : 'Not graded'}`}
                        color={submission.gradeDetails ? "success" : "default"}
                      />
                    ) : (
                      <Chip
                        label="Not Submitted"
                        color="warning"
                      />
                    )}
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        )}
      </Box>

      {/* Assignment Details Modal */}
      <Dialog 
        open={!!selectedAssignment} 
        onClose={handleCloseAssignmentDetails} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: {
            backgroundColor: getBackgroundColor(),
            color: getTextColor(),
            border: `1px solid ${getDividerColor()}`
          }
        }}
      >
        <DialogTitle sx={{ color: getTextColor() }}>{selectedAssignment?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: getTextColor() }}>
            <strong>Description:</strong> {selectedAssignment?.description}
          </Typography>
          <Typography variant="body1" sx={{ color: getTextColor(), mt: 1 }}>
            <strong>Requirements:</strong> {selectedAssignment?.requirements || "N/A"}
          </Typography>
          <Typography variant="body1" sx={{ color: getTextColor(), mt: 1 }}>
            <strong>Due Date:</strong> {new Date(selectedAssignment?.dueDate).toLocaleDateString()}
          </Typography>
          <Typography variant="body1" sx={{ color: getTextColor(), mt: 1 }}>
            <strong>Status:</strong> {calculateDaysLeft(selectedAssignment?.dueDate)}
          </Typography>

          {submissions.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ color: getTextColor() }}>
                <strong>Submissions:</strong>
              </Typography>
              {submissions.map((submission) => (
                <Box 
                  key={submission._id} 
                  sx={{ 
                    mb: 2, 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: getDividerColor(),
                    borderRadius: 1,
                    backgroundColor: theme.palette?.background?.default || (theme.palette?.mode === 'dark' ? '#1e1e1e' : '#fafafa')
                  }}
                >
                  <Typography variant="body2" sx={{ color: getTextColor(), mt: 1 }}>
                    <strong>Submitted At:</strong> {new Date(submission.submittedAt).toLocaleString()}
                  </Typography>
                  {submission.gradeDetails && (
                    <Box sx={{ mt: 1, p: 1, backgroundColor: theme.palette?.action?.hover || 'rgba(255, 255, 255, 0.08)', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ color: getTextColor() }}>
                        <strong>Grade:</strong> {submission.gradeDetails.grade}
                      </Typography>
                      <Typography variant="body2" sx={{ color: getTextColor(), mt: 1 }}>
                        <strong>Feedback:</strong> {submission.gradeDetails.feedback || 'No feedback provided'}
                      </Typography>
                    </Box>
                  )}
                  {submission.files && submission.files.length > 0 ? (
submission.files.map((file, index) => (
    <Box key={index} sx={{ my: 1 }}>
      <a href={file.url} target="_blank" rel="noopener noreferrer">
        <Chip
          avatar={
            <Avatar sx={{ 
              backgroundColor: getPrimaryColor(),
              color: theme.palette?.primary?.contrastText || '#fff'
            }}>
              <DescriptionIcon />
            </Avatar>
          }
          label={file.filename || 'File'}
          clickable
          sx={{ 
            mt: 1,
            color: getTextColor(),
            backgroundColor: theme.palette?.mode === 'dark' 
              ? getGreyColor(800) 
              : getGreyColor(200),
            '&:hover': {
              backgroundColor: theme.palette?.mode === 'dark' 
                ? getGreyColor(700) 
                : getGreyColor(300),
            }
          }}
        />
      </a>
    </Box>
  ))
) : (
  <Typography variant="body2">No files uploaded</Typography>
)}

                </Box>
              ))}
            </Box>
          )}

          {!studentSubmissions.some(s => s.assignment._id === selectedAssignment?._id) && (
            <Box
              {...getRootProps()}
              sx={{
                mt: 2,
                p: 2,
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.400',
                backgroundColor: isDragActive ? 'grey.100' : 'grey.50',
                cursor: submissionComplete ? 'not-allowed' : 'pointer',
                opacity: submissionComplete ? 0.5 : 1,
              }}
            >
              <input {...getInputProps()} />
              <Typography>
                {submissionComplete
                  ? 'Submission Complete'
                  : isDragActive
                    ? 'Drop your files here!'
                    : 'Drag & drop files here, or click to select'}
              </Typography>
              <List>
                {files.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={file.name} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseAssignmentDetails} 
            color="secondary"
            sx={{ color: getTextColor() }}
          >
            Close
          </Button>
          {!studentSubmissions.some(s => s.assignment._id === selectedAssignment?._id) && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSubmitAssignment(selectedAssignment._id)}
              disabled={isSubmitting || files.length === 0 || submissionComplete}
            >
              {isSubmitting ? "Submitting..." : "Submit Assignment"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}