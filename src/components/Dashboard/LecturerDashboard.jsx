import { useState, useEffect } from "react";
import {
  Container, Typography, Box, Button, TextField, Card, CardContent, CardActions, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tabs, Tab, InputAdornment, List, ListItem, ListItemText,
  Paper, Chip, Avatar, useTheme, Tooltip
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Description as DescriptionIcon
} from "@mui/icons-material";
import api from "../../services/api";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTheme as useAppTheme } from "../../contexts/ThemeContext";

// Reusable button styles with gradient
const buttonStyles = {
  width: "100%",
  background: "linear-gradient(135deg, #6a11cb, #2575fc)",
  color: "white",
  "&:hover": {
    background: "linear-gradient(135deg, #5a0dbb, #1f67e0)",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)"
  },
};

export default function LecturerDashboard() {
  const theme = useTheme();
  const appTheme = useAppTheme();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newCourse, setNewCourse] = useState({ name: "", description: "" });
  const [newAssignment, setNewAssignment] = useState({ title: "", description: "", dueDate: "" });
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [openCourseDialog, setOpenCourseDialog] = useState(false);
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);
  const [openEnrollDialog, setOpenEnrollDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsDescription, setNewsDescription] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editGrade, setEditGrade] = useState("");
  const [editFeedback, setEditFeedback] = useState("");
  const [viewGradeDialogOpen, setViewGradeDialogOpen] = useState(false);
  const [viewGradeData, setViewGradeData] = useState(null);

  // Dark mode styles
  const darkModeStyles = {
    backgroundColor: appTheme.palette.background.paper,
    color: appTheme.palette.text.primary,
    borderColor: appTheme.palette.mode === 'dark' ? '#444' : '#e0e0e0',
    cardBg: appTheme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
    paperBg: appTheme.palette.mode === 'dark' ? '#252525' : '#f5f5f5',
    textSecondary: appTheme.palette.mode === 'dark' ? '#bbb' : '#666',
    dialogBg: appTheme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
    inputBg: appTheme.palette.mode === 'dark' ? '#333' : '#ffffff',
    chipBg: appTheme.palette.mode === 'dark' ? '#333' : '#e0e0e0',
    tabIndicator: appTheme.palette.mode === 'dark' ? '#fff' : '#6a11cb',
    tabSelected: appTheme.palette.mode === 'dark' ? '#fff' : '#6a11cb',
    fontWeight: appTheme.textWeights[appTheme.fontWeight] // Added font weight
  };



  useEffect(() => {
    const fetchData = async () => {
      await fetchCourses();

      try {
        const { data: studentsList } = await api.get("/users/students");
        const studentsWithCourses = await Promise.all(
          studentsList.map(async (student) => {
            const enrolledCourses = await fetchEnrolledCoursesForStudent(student._id);
            return { ...student, enrolledCourses };
          })
        );
        setStudents(studentsWithCourses);
        console.log("Students with courses loaded:", studentsWithCourses);
      } catch (error) {
        console.error("Error loading students:", error);
      }
    };

    fetchData();
  }, []);


  // Fetch Courses
  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses");
      const coursesWithAssignments = await Promise.all(
        response.data.map(async (course) => {
          const assignments = await fetchAssignments(course._id);
          return { ...course, assignments: assignments || [] };
        })
      );
      setCourses(coursesWithAssignments);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Fetch Students
  const fetchStudents = async () => {
    try {
      const response = await api.get("/users/students");
      const studentsWithCourses = await Promise.all(
        response.data.map(async (student) => {
          const enrolledCourses = await fetchEnrolledCoursesForStudent(student._id);
          return { ...student, enrolledCourses };
        })
      );
      setStudents(studentsWithCourses);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Fetch Enrolled Courses for a Specific Student
  const fetchEnrolledCoursesForStudent = async (studentId) => {
    try {
      const response = await api.get(`/courses/student/${studentId}`);
      console.log(`Enrolled courses for student ${studentId}:`, response.data);
      return response.data; // returns courses array
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      return [];
    }
  };
  // Fetch Assignments for a Course
  const fetchAssignments = async (courseId) => {
    try {
      const response = await api.get(`/assignments?courseId=${courseId}`); 
      return response.data || [];
    } catch (error) {
      console.error("Error fetching assignments:", error);
      return [];
    }
  };

  // Fetch Submissions for an Assignment
  const fetchSubmissions = async (assignmentId) => {
    try {
      const response = await api.get(`/submissions/assignment/${assignmentId}`);
      console.log("Submissions API Response:", response.data);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching submissions:", error);
      return [];
    }
  };

  // Fetch grades and feedback for a specific assignment and student
  const fetchGradeForSubmission = async (assignmentId, studentId) => {
    try {
      const response = await api.get(`/grades/assignment/${assignmentId}/student/${studentId}`);
      return response.data; // Return the grade and feedback
    } catch (error) {
      console.error("Error fetching grade for submission:", error);
      return null; // Return null if no grade is found
    }
  };

  // Handle Tab Change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Filter Students Based on Search Query
  const filteredStudents = students.filter((student) =>
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open "Add Course" Dialog
  const handleOpenCourseDialog = () => setOpenCourseDialog(true);

  // Open "Add Assignment" Dialog
  const handleOpenAssignmentDialog = (course) => {
    setSelectedCourse(course);
    setOpenAssignmentDialog(true);
  };

  // Open "Enroll Student" Dialog
  const handleOpenEnrollDialog = (student) => {
    setSelectedStudent(student);
    setOpenEnrollDialog(true);
  };

  // Close All Dialogs
  const handleCloseDialog = () => {
    setOpenCourseDialog(false);
    setOpenAssignmentDialog(false);
    setOpenEnrollDialog(false);
    setNewCourse({ name: "", description: "" });
    setNewAssignment({ title: "", description: "", dueDate: "" });
    setSelectedStudent(null);
  };

  // Add Course
  const handleAddCourse = async () => {
    if (!newCourse.name.trim()) {
      alert("Please enter a course name.");
      return;
    }
    try {
      const response = await api.post("/courses", newCourse);
      setCourses((prev) => [...prev, response.data]);
      handleCloseDialog();
    } catch (error) {
      console.error("Error adding course:", error);
      alert("Error adding course.");
    }
  };

  // Delete Course
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/courses/${courseId}`);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
      alert("Course deleted!");
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Error deleting course.");
    }
  };

  // Add Assignment
  const handleAddAssignment = async () => {
    if (!newAssignment.title || !newAssignment.dueDate) {
      alert("Please fill all fields.");
      return;
    }
    try {
      const response = await api.post(`/courses/${selectedCourse._id}/assignments`, newAssignment);
      setCourses((prev) =>
        prev.map((course) =>
          course._id === selectedCourse._id
            ? { ...course, assignments: [...course.assignments, response.data.assignment] }
            : course
        )
      );
      handleCloseDialog();
    } catch (error) {
      console.error("Error adding assignment:", error);
      alert("Error adding assignment.");
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async (courseId, assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await api.delete(`/assignments/${courseId}/assignments/${assignmentId}`);
      setCourses((prev) =>
        prev.map((course) =>
          course._id === courseId
            ? { ...course, assignments: course.assignments.filter((a) => a._id !== assignmentId) }
            : course
        )
      );
      alert("Assignment deleted!");
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert("Error deleting assignment.");
    }
  };

  // Enroll Student in a Course
  const handleEnrollStudent = async (studentId, courseId) => {
    try {
      await api.post(`/courses/${courseId}/enroll`, { students: [studentId] });
      fetchStudents();
      alert("Student enrolled successfully!");
    } catch (error) {
      console.error("Error enrolling student:", error);
      alert("Error enrolling student.");
    }
  };

  // Unenroll Student from a Course
  const handleUnenrollStudent = async (studentId, courseId) => {
    try {
      await api.post(`/courses/${courseId}/unenroll`, { students: [studentId] });
      fetchStudents();
      alert("Student unenrolled successfully!");
    } catch (error) {
      console.error("Error unenrolling student:", error);
      alert("Error unenrolling student.");
    }
  };

  // Format Due Date
  const formatDueDate = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const timeDiff = due - now;

    if (timeDiff <= 0) {
      return {
        text: `Overdue / ${due.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`,
        color: "red",
      };
    }

    const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
    const daysDiff = Math.floor(hoursDiff / 24);

    if (daysDiff > 0) {
      return {
        text: `${daysDiff} day${daysDiff > 1 ? "s" : ""} left / ${due.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`,
        color: "inherit",
      };
    } else {
      return {
        text: `${hoursDiff} hour${hoursDiff > 1 ? "s" : ""} left / ${due.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`,
        color: "inherit",
      };
    }
  };

  // Create News
  const handleCreateNews = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        "/news-events",
        {
          title: newsTitle,
          description: newsDescription,
          type: "news",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("News created successfully!");
      setNewsTitle("");
      setNewsDescription("");
    } catch (error) {
      console.error("Error creating news:", error.response?.data || error.message);
      alert("Error creating news: " + (error.response?.data?.message || error.message));
    }
  };

  // Create Event
  const handleCreateEvent = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        "/news-events",
        {
          title: eventTitle,
          description: eventDescription,
          type: "event",
          startDate: eventStartDate,
          endDate: eventEndDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Event created successfully!");
      setEventTitle("");
      setEventDescription("");
      setEventStartDate("");
      setEventEndDate("");
    } catch (error) {
      console.error("Error creating event:", error.response?.data || error.message);
      alert("Error creating event: " + (error.response?.data?.message || error.message));
    }
  };

  // Handle Click on a Course
  const handleCourseClick = async (course) => {
    try {
      const assignments = await fetchAssignments(course._id);
      setSelectedCourse({ ...course, assignments });
    } catch (error) {
      console.error("Error fetching assignments for the course:", error);
      alert("Failed to load assignments for the selected course.");
    }
  };

  // Handle Click on an Assignment (Updated to fetch submissions and grades)
  const handleAssignmentClick = async (assignment) => {
    try {
      const submissions = await fetchSubmissions(assignment._id);
      const submissionsWithGrades = await Promise.all(
        submissions.map(async (submission) => {
          try {
            const response = await api.get(`/grades/${submission._id}`);
            return { ...submission, grade: response.data };
          } catch (error) {
            // If no grade exists, just return the submission without grade
            return submission;
          }
        })
      );
      setSelectedAssignment({ ...assignment, submissions: submissionsWithGrades });
    } catch (error) {
      console.error("Error fetching submissions:", error);
      alert("Failed to load submissions.");
    }
  };

  // Close Assignment Details Modal
  const handleCloseAssignmentDetails = () => {
    setSelectedAssignment(null);
  };

  // Open feedback dialog
  const handleOpenFeedbackDialog = (submission) => {
    setSelectedSubmission(submission);
    setFeedbackText(submission.feedback || ""); // Pre-fill with existing feedback if available
    setFeedbackDialogOpen(true);
  };

  // Close feedback dialog
  const handleCloseFeedbackDialog = () => {
    setFeedbackDialogOpen(false);
    setFeedbackText("");
    setSelectedSubmission(null);
  };

  // Save feedback
  const handleSaveFeedback = async () => {
    try {
      if (!selectedSubmission) return;

      await api.post(`/grades/${selectedSubmission._id}`, {
        grade: selectedSubmission.grade || 0, // Ensure grade is sent
        feedback: feedbackText,
      });

      alert("Feedback saved successfully!");
      handleCloseFeedbackDialog();
    } catch (error) {
      console.error("Error saving feedback:", error);
      alert(error.response?.data?.message || "Error saving feedback.");
    }
  };

  // Open edit dialog
  const handleOpenEditDialog = (submission) => {
    setSelectedSubmission(submission);
    setEditGrade(submission.grade?.grade || ""); 
    setEditFeedback(submission.grade?.feedback || "");
    setEditDialogOpen(true);
  };

  // Close edit dialog
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditGrade("");
    setEditFeedback("");
    setSelectedSubmission(null);
  };

  // Save grade and feedback
  const handleSaveEdit = async () => {
    try {
      if (!selectedSubmission) return;

      const response = await api.post(`/grades/${selectedSubmission._id}`, {
        grade: editGrade,
        feedback: editFeedback,
      });

      alert("Grade and feedback saved successfully!");

      setSelectedAssignment((prev) => {
        if (!prev) return prev;
        const updatedSubmissions = prev.submissions.map((submission) =>
          submission._id === selectedSubmission._id
            ? { ...submission, grade: response.data.grade }
            : submission
        );
        return { ...prev, submissions: updatedSubmissions };
      });

      handleCloseEditDialog();
    } catch (error) {
      console.error("Error saving grade and feedback:", error);
      alert(error.response?.data?.message || "Error saving grade and feedback.");
    }
  };

  // Open view grade dialog
  const handleViewGradeDialogOpen = (submission) => {
    setViewGradeData(submission.grade);
    setViewGradeDialogOpen(true);
  };

  // Close view grade dialog
  const handleViewGradeDialogClose = () => {
    setViewGradeDialogOpen(false);
    setViewGradeData(null);
  };

  return (
    <Container>
      <Box sx={{
        mt: 4,
        textAlign: "center",
        backgroundColor: darkModeStyles.backgroundColor,
        color: darkModeStyles.color,
        p: 3,
        borderRadius: 2,
        boxShadow: appTheme.palette.mode === 'dark'
          ? '0px 4px 20px rgba(0, 0, 0, 0.8)'
          : '0px 4px 20px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${darkModeStyles.borderColor}`
      }}>
        {/* Header with Theme Controls */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}>
          <Typography variant="h3" gutterBottom sx={{
            color: darkModeStyles.color,
            fontWeight: darkModeStyles.fontWeight
          }}>
            Lecturer Dashboard
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: darkModeStyles.tabIndicator,
            },
            '& .MuiTab-root': {
              color: darkModeStyles.textSecondary,
              fontWeight: darkModeStyles.fontWeight,
              '&.Mui-selected': {
                color: darkModeStyles.tabSelected,
                fontWeight: darkModeStyles.fontWeight
              }
            }
          }}
        >
          <Tab label="Course" />
          <Tab label="Enroll" />
          <Tab label="Homepage" />
          <Tab label="Submissions" />
        </Tabs>

        {/* Courses & Assignments Tab */}
        {tabValue === 0 && (
          <>
            <Button
              variant="contained"
              sx={{
                ...buttonStyles,
                fontWeight: darkModeStyles.fontWeight
              }}
              onClick={handleOpenCourseDialog}
            >
              ➕ Add Course
            </Button>

            <Box sx={{
              mt: 2,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 3,
            }}>
              {courses.map((course) => (
                <Card
                  key={course._id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: darkModeStyles.cardBg,
                    border: `1px solid ${darkModeStyles.borderColor}`,
                    color: darkModeStyles.color
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{
                      color: darkModeStyles.color,
                      fontWeight: darkModeStyles.fontWeight
                    }}>
                      {course.name}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: darkModeStyles.textSecondary,
                      fontWeight: darkModeStyles.fontWeight
                    }}>
                      Lecturer: {course.lecturer?.email || "Unknown"}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: darkModeStyles.textSecondary,
                      fontWeight: darkModeStyles.fontWeight
                    }}>
                      Course ID: {course._id}
                    </Typography>
                    <Typography variant="h6" sx={{
                      mt: 2,
                      color: darkModeStyles.color,
                      fontWeight: darkModeStyles.fontWeight
                    }}>
                      Assignments
                    </Typography>
                    {course.assignments?.length ? (
                      course.assignments.map((assignment) => {
                        const dueDateInfo = formatDueDate(assignment.dueDate);
                        return (
                          <Box
                            key={assignment._id}
                            sx={{
                              mt: 1,
                              p: 1,
                              border: `1px solid ${darkModeStyles.borderColor}`,
                              borderRadius: 1,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box sx={{ textAlign: "center", flex: 1, mr: 2 }}>
                              <Typography variant="body1" sx={{
                                color: darkModeStyles.color,
                                fontWeight: darkModeStyles.fontWeight
                              }}>
                                {assignment.title}
                              </Typography>
                              <Typography variant="body2" sx={{
                                color: dueDateInfo.color,
                                fontWeight: darkModeStyles.fontWeight
                              }}>
                                {dueDateInfo.text}
                              </Typography>
                            </Box>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteAssignment(course._id, assignment._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        );
                      })
                    ) : (
                      <Typography variant="body2" sx={{
                        color: darkModeStyles.textSecondary,
                        fontWeight: darkModeStyles.fontWeight
                      }}>
                        No assignments
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      sx={{
                        ...buttonStyles,
                        fontWeight: darkModeStyles.fontWeight
                      }}
                      onClick={() => handleOpenAssignmentDialog(course)}
                    >
                      📌 Add Assignment
                    </Button>
                    <Button
                      variant="contained"
                      sx={{
                        ...buttonStyles,
                        fontWeight: darkModeStyles.fontWeight
                      }}
                      onClick={() => handleDeleteCourse(course._id)}
                    >
                      🗑 Delete Course
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </>
        )}

        {/* Enrollment Management Tab */}
        {tabValue === 1 && (
          <>
            <TextField
              fullWidth
              placeholder="Search students by email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                mt: 2,
                mb: 2,
                '& .MuiInputBase-input': {
                  color: darkModeStyles.color,
                  backgroundColor: darkModeStyles.inputBg,
                  fontWeight: darkModeStyles.fontWeight
                },
                '& .MuiInputLabel-root': {
                  color: darkModeStyles.textSecondary,
                  fontWeight: darkModeStyles.fontWeight
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: darkModeStyles.borderColor,
                  },
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{
                      color: darkModeStyles.textSecondary,
                      fontWeight: darkModeStyles.fontWeight
                    }} />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ mt: 2 }}>
              {filteredStudents.map((student) => (
                <Card
                  key={student._id}
                  sx={{
                    mb: 2,
                    backgroundColor: darkModeStyles.cardBg,
                    color: darkModeStyles.color,
                    border: `1px solid ${darkModeStyles.borderColor}`
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{
                      color: darkModeStyles.color,
                      fontWeight: darkModeStyles.fontWeight
                    }}>
                      {student.email}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: darkModeStyles.textSecondary,
                      fontWeight: darkModeStyles.fontWeight
                    }}>
                      Enrolled Courses:{" "}
                      {student.enrolledCourses?.length > 0 ? (
                        student.enrolledCourses.map((course) => (
                          <Box
                            key={course._id}
                            sx={{ display: "flex", alignItems: "center", gap: 1 }}
                          >
                            <Typography sx={{
                              color: darkModeStyles.color,
                              fontWeight: darkModeStyles.fontWeight
                            }}>
                              {course.name}
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleUnenrollStudent(student._id, course._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{
                          color: darkModeStyles.textSecondary,
                          fontWeight: darkModeStyles.fontWeight
                        }}>
                          No courses enrolled.
                        </Typography>
                      )}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      sx={{
                        ...buttonStyles,
                        fontWeight: darkModeStyles.fontWeight
                      }}
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenEnrollDialog(student)}
                    >
                      Add Course
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </>
        )}

        {/* News & Events Tab */}
        {tabValue === 2 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h4" gutterBottom sx={{
              color: darkModeStyles.color,
              fontWeight: darkModeStyles.fontWeight
            }}>
              Create News/Event
            </Typography>

            {/* News Creation Form */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{
                color: darkModeStyles.color,
                fontWeight: darkModeStyles.fontWeight
              }}>
                Create News
              </Typography>
              <TextField
                fullWidth
                label="Title"
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiInputBase-input': {
                    color: darkModeStyles.color,
                    backgroundColor: darkModeStyles.inputBg,
                    fontWeight: darkModeStyles.fontWeight
                  },
                  '& .MuiInputLabel-root': {
                    color: darkModeStyles.textSecondary,
                    fontWeight: darkModeStyles.fontWeight
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: darkModeStyles.borderColor,
                    },
                    '&:hover fieldset': {
                      borderColor: darkModeStyles.tabSelected,
                    }
                  }
                }}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={newsDescription}
                onChange={(e) => setNewsDescription(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiInputBase-input': {
                    color: darkModeStyles.color,
                    backgroundColor: darkModeStyles.inputBg,
                    fontWeight: darkModeStyles.fontWeight
                  },
                  '& .MuiInputLabel-root': {
                    color: darkModeStyles.textSecondary,
                    fontWeight: darkModeStyles.fontWeight
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: darkModeStyles.borderColor,
                    },
                    '&:hover fieldset': {
                      borderColor: darkModeStyles.tabSelected,
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleCreateNews}
                sx={{
                  ...buttonStyles,
                  fontWeight: darkModeStyles.fontWeight
                }}
              >
                Create News
              </Button>
            </Box>

            {/* Event Creation Form */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{
                color: darkModeStyles.color,
                fontWeight: darkModeStyles.fontWeight
              }}>
                Create Event
              </Typography>
              <TextField
                fullWidth
                label="Title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiInputBase-input': {
                    color: darkModeStyles.color,
                    backgroundColor: darkModeStyles.inputBg,
                    fontWeight: darkModeStyles.fontWeight
                  },
                  '& .MuiInputLabel-root': {
                    color: darkModeStyles.textSecondary,
                    fontWeight: darkModeStyles.fontWeight
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: darkModeStyles.borderColor,
                    },
                    '&:hover fieldset': {
                      borderColor: darkModeStyles.tabSelected,
                    }
                  }
                }}
              />
              <TextField
                fullWidth
                label="Start Date & Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={eventStartDate}
                onChange={(e) => setEventStartDate(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiInputBase-input': {
                    color: darkModeStyles.color,
                    backgroundColor: darkModeStyles.inputBg,
                    fontWeight: darkModeStyles.fontWeight
                  },
                  '& .MuiInputLabel-root': {
                    color: darkModeStyles.textSecondary,
                    fontWeight: darkModeStyles.fontWeight
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: darkModeStyles.borderColor,
                    },
                    '&:hover fieldset': {
                      borderColor: darkModeStyles.tabSelected,
                    }
                  }
                }}
              />
              <TextField
                fullWidth
                label="End Date & Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiInputBase-input': {
                    color: darkModeStyles.color,
                    backgroundColor: darkModeStyles.inputBg,
                    fontWeight: darkModeStyles.fontWeight
                  },
                  '& .MuiInputLabel-root': {
                    color: darkModeStyles.textSecondary,
                    fontWeight: darkModeStyles.fontWeight
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: darkModeStyles.borderColor,
                    },
                    '&:hover fieldset': {
                      borderColor: darkModeStyles.tabSelected,
                    }
                  }
                }}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiInputBase-input': {
                    color: darkModeStyles.color,
                    backgroundColor: darkModeStyles.inputBg,
                    fontWeight: darkModeStyles.fontWeight
                  },
                  '& .MuiInputLabel-root': {
                    color: darkModeStyles.textSecondary,
                    fontWeight: darkModeStyles.fontWeight
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: darkModeStyles.borderColor,
                    },
                    '&:hover fieldset': {
                      borderColor: darkModeStyles.tabSelected,
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleCreateEvent}
                sx={{
                  ...buttonStyles,
                  fontWeight: darkModeStyles.fontWeight
                }}
              >
                Create Event
              </Button>
            </Box>
          </Box>
        )}

        {/* Course Submissions Tab */}
        {tabValue === 3 && (
          <Box>
            <Typography variant="h4" gutterBottom sx={{
              color: darkModeStyles.color,
              fontWeight: darkModeStyles.fontWeight
            }}>
              Course Submissions
            </Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Paper
                elevation={3}
                sx={{
                  flex: 1,
                  p: 2,
                  backgroundColor: darkModeStyles.paperBg,
                  color: darkModeStyles.color,
                  border: `1px solid ${darkModeStyles.borderColor}`
                }}
              >
                <Typography variant="h6" gutterBottom sx={{
                  color: darkModeStyles.color,
                  fontWeight: darkModeStyles.fontWeight
                }}>
                  All Courses
                </Typography>
                <List>
                  {courses.map((course) => (
                    <ListItem
                      button
                      key={course._id}
                      onClick={() => handleCourseClick(course)}
                      sx={{
                        '&:hover': {
                          backgroundColor: appTheme.palette.mode === 'dark' ? '#333' : '#f5f5f5'
                        }
                      }}
                    >
                      <ListItemText
                        primary={course.name}
                        primaryTypographyProps={{
                          color: darkModeStyles.color,
                          fontWeight: darkModeStyles.fontWeight
                        }}
                        secondaryTypographyProps={{
                          color: darkModeStyles.textSecondary,
                          fontWeight: darkModeStyles.fontWeight
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>

              {selectedCourse && (
                <Paper
                  elevation={3}
                  sx={{
                    flex: 1,
                    p: 2,
                    backgroundColor: darkModeStyles.paperBg,
                    color: darkModeStyles.color,
                    border: `1px solid ${darkModeStyles.borderColor}`
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{
                    color: darkModeStyles.color,
                    fontWeight: darkModeStyles.fontWeight
                  }}>
                    Assignments for {selectedCourse.name}
                  </Typography>
                  <List>
                    {selectedCourse.assignments?.length > 0 ? (
                      selectedCourse.assignments.map((assignment) => (
                        <ListItem
                          key={assignment._id}
                          button
                          onClick={() => handleAssignmentClick(assignment)}
                          sx={{
                            '&:hover': {
                              backgroundColor: appTheme.palette.mode === 'dark' ? '#333' : '#f5f5f5'
                            }
                          }}
                        >
                          <ListItemText
                            primary={assignment.title}
                            secondary={`Due: ${new Date(assignment.dueDate).toLocaleDateString()}`}
                            primaryTypographyProps={{
                              color: darkModeStyles.color,
                              fontWeight: darkModeStyles.fontWeight
                            }}
                            secondaryTypographyProps={{
                              color: darkModeStyles.textSecondary,
                              fontWeight: darkModeStyles.fontWeight
                            }}
                          />
                          {assignment.submissions?.length > 0 && (
                            <Chip
                              label={`${assignment.submissions.length} submissions`}
                              sx={{
                                backgroundColor: darkModeStyles.chipBg,
                                color: darkModeStyles.color,
                                fontWeight: darkModeStyles.fontWeight
                              }}
                            />
                          )}
                        </ListItem>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{
                        color: darkModeStyles.textSecondary,
                        fontWeight: darkModeStyles.fontWeight
                      }}>
                        No assignments available for this course.
                      </Typography>
                    )}
                  </List>
                </Paper>
              )}
            </Box>
          </Box>
        )}

        {/* Dialog components */}
        {/* Add Course Dialog */}
        <Dialog
          open={openCourseDialog}
          onClose={handleCloseDialog}
          PaperProps={{
            sx: {
              backgroundColor: darkModeStyles.dialogBg,
              color: darkModeStyles.color,
            }
          }}
        >
          <DialogTitle sx={{
            color: darkModeStyles.color,
            fontWeight: darkModeStyles.fontWeight
          }}>
            Add New Course
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Course Name"
              fullWidth
              value={newCourse.name}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              sx={{
                '& .MuiInputBase-input': {
                  color: darkModeStyles.color,
                  backgroundColor: darkModeStyles.inputBg,
                  fontWeight: darkModeStyles.fontWeight
                },
                '& .MuiInputLabel-root': {
                  color: darkModeStyles.textSecondary,
                  fontWeight: darkModeStyles.fontWeight
                }
              }}
            />
            <TextField
              margin="dense"
              label="Course Description"
              fullWidth
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              sx={{
                '& .MuiInputBase-input': {
                  color: darkModeStyles.color,
                  backgroundColor: darkModeStyles.inputBg,
                  fontWeight: darkModeStyles.fontWeight
                },
                '& .MuiInputLabel-root': {
                  color: darkModeStyles.textSecondary,
                  fontWeight: darkModeStyles.fontWeight
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              sx={{
                ...buttonStyles,
                fontWeight: darkModeStyles.fontWeight
              }}
              onClick={handleCloseDialog}
            >
              Cancel
            </Button>
            <Button
              sx={{
                ...buttonStyles,
                fontWeight: darkModeStyles.fontWeight
              }}
              onClick={handleAddCourse}
            >
              Add Course
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Assignment Dialog */}
        <Dialog
          open={openAssignmentDialog}
          onClose={handleCloseDialog}
          PaperProps={{
            sx: {
              backgroundColor: darkModeStyles.dialogBg,
              color: darkModeStyles.color,
            }
          }}
        >
          <DialogTitle sx={{
            color: darkModeStyles.color,
            fontWeight: darkModeStyles.fontWeight
          }}>
            Add New Assignment
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Assignment Title"
              fullWidth
              value={newAssignment.title}
              onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
              sx={{
                '& .MuiInputBase-input': {
                  color: darkModeStyles.color,
                  backgroundColor: darkModeStyles.inputBg,
                  fontWeight: darkModeStyles.fontWeight
                },
                '& .MuiInputLabel-root': {
                  color: darkModeStyles.textSecondary,
                  fontWeight: darkModeStyles.fontWeight
                }
              }}
            />
            <TextField
              margin="dense"
              label="Assignment Description"
              fullWidth
              value={newAssignment.description}
              onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
              sx={{
                '& .MuiInputBase-input': {
                  color: darkModeStyles.color,
                  backgroundColor: darkModeStyles.inputBg,
                  fontWeight: darkModeStyles.fontWeight
                },
                '& .MuiInputLabel-root': {
                  color: darkModeStyles.textSecondary,
                  fontWeight: darkModeStyles.fontWeight
                }
              }}
            />
            <TextField
              margin="dense"
              label="Due Date"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newAssignment.dueDate}
              onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
              sx={{
                '& .MuiInputBase-input': {
                  color: darkModeStyles.color,
                  backgroundColor: darkModeStyles.inputBg,
                  fontWeight: darkModeStyles.fontWeight
                },
                '& .MuiInputLabel-root': {
                  color: darkModeStyles.textSecondary,
                  fontWeight: darkModeStyles.fontWeight
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              sx={{
                ...buttonStyles,
                fontWeight: darkModeStyles.fontWeight
              }}
              onClick={handleCloseDialog}
            >
              Cancel
            </Button>
            <Button
              sx={{
                ...buttonStyles,
                fontWeight: darkModeStyles.fontWeight
              }}
              onClick={handleAddAssignment}
            >
              Add Assignment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enroll Student Dialog */}
        <Dialog
          open={openEnrollDialog}
          onClose={handleCloseDialog}
          PaperProps={{
            sx: {
              backgroundColor: darkModeStyles.dialogBg,
              color: darkModeStyles.color,
            }
          }}
        >
          <DialogTitle sx={{
            color: darkModeStyles.color,
            fontWeight: darkModeStyles.fontWeight
          }}>
            Enroll Student in a Course
          </DialogTitle>
          <DialogContent>
            <List>
              {courses
                .filter((course) => !course.enrolledStudents?.includes(selectedStudent?._id))
                .map((course) => (
                  <ListItem
                    key={course._id}
                    button
                    onClick={() => {
                      handleEnrollStudent(selectedStudent._id, course._id);
                      handleCloseDialog();
                    }}
                    sx={{
                      '&:hover': {
                        backgroundColor: appTheme.palette.mode === 'dark' ? '#333' : '#f5f5f5'
                      }
                    }}
                  >
                    <ListItemText
                      primary={course.name}
                      primaryTypographyProps={{
                        color: darkModeStyles.color,
                        fontWeight: darkModeStyles.fontWeight
                      }}
                    />
                  </ListItem>
                ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button
              sx={{
                ...buttonStyles,
                fontWeight: darkModeStyles.fontWeight
              }}
              onClick={handleCloseDialog}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Feedback Dialog */}
        <Dialog
          open={feedbackDialogOpen}
          onClose={handleCloseFeedbackDialog}
          PaperProps={{
            sx: {
              backgroundColor: darkModeStyles.dialogBg,
              color: darkModeStyles.color,
            }
          }}
        >
          <DialogTitle sx={{
            color: darkModeStyles.color,
            fontWeight: darkModeStyles.fontWeight
          }}>
            Add Feedback
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Feedback"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              sx={{
                '& .MuiInputBase-input': {
                  color: darkModeStyles.color,
                  backgroundColor: darkModeStyles.inputBg,
                  fontWeight: darkModeStyles.fontWeight
                },
                '& .MuiInputLabel-root': {
                  color: darkModeStyles.textSecondary,
                  fontWeight: darkModeStyles.fontWeight
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              sx={{
                ...buttonStyles,
                fontWeight: darkModeStyles.fontWeight
              }}
              onClick={handleCloseFeedbackDialog}
            >
              Cancel
            </Button>
            <Button
              sx={{
                ...buttonStyles,
                fontWeight: darkModeStyles.fontWeight
              }}
              onClick={handleSaveFeedback}
            >
              Save Feedback
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Grade Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          PaperProps={{
            sx: {
              backgroundColor: darkModeStyles.dialogBg,
              color: darkModeStyles.color,
            }
          }}
        >
          <DialogTitle sx={{
            color: darkModeStyles.color,
            fontWeight: darkModeStyles.fontWeight
          }}>
            Edit Grade and Feedback
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              type="number"
              label="Grade (1-100)"
              placeholder="Enter grade"
              value={editGrade}
              onChange={(e) => setEditGrade(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiInputBase-input': {
                  color: darkModeStyles.color,
                  backgroundColor: darkModeStyles.inputBg,
                  fontWeight: darkModeStyles.fontWeight
                },
                '& .MuiInputLabel-root': {
                  color: darkModeStyles.textSecondary,
                  fontWeight: darkModeStyles.fontWeight
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: darkModeStyles.borderColor,
                  },
                }
              }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Feedback"
              placeholder="Enter feedback"
              value={editFeedback}
              onChange={(e) => setEditFeedback(e.target.value)}
              sx={{
                '& .MuiInputBase-input': {
                  color: darkModeStyles.color,
                  backgroundColor: darkModeStyles.inputBg,
                  fontWeight: darkModeStyles.fontWeight
                },
                '& .MuiInputLabel-root': {
                  color: darkModeStyles.textSecondary,
                  fontWeight: darkModeStyles.fontWeight
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: darkModeStyles.borderColor,
                  },
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseEditDialog}
              sx={{
                ...buttonStyles,
                fontWeight: darkModeStyles.fontWeight
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              sx={{
                ...buttonStyles,
                fontWeight: darkModeStyles.fontWeight
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Grade Dialog */}
        <Dialog
          open={viewGradeDialogOpen}
          onClose={handleViewGradeDialogClose}
          PaperProps={{
            sx: {
              backgroundColor: darkModeStyles.dialogBg,
              color: darkModeStyles.color,
            }
          }}
        >
          <DialogTitle sx={{
            color: darkModeStyles.color,
            fontWeight: darkModeStyles.fontWeight
          }}>
            Graded Submission
          </DialogTitle>
          <DialogContent>
            {viewGradeData ? (
              <>
                <Typography variant="body1" sx={{
                  color: darkModeStyles.color,
                  fontWeight: darkModeStyles.fontWeight
                }}>
                  <strong>Grade:</strong> {viewGradeData.grade}
                </Typography>
                <Typography variant="body1" sx={{
                  color: darkModeStyles.color,
                  fontWeight: darkModeStyles.fontWeight
                }}>
                  <strong>Feedback:</strong> {viewGradeData.feedback || "No feedback provided"}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" sx={{
                color: darkModeStyles.textSecondary,
                fontWeight: darkModeStyles.fontWeight
              }}>
                No grade data available.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleViewGradeDialogClose}
              sx={{
                ...buttonStyles,
                fontWeight: darkModeStyles.fontWeight
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assignment Submissions Dialog */}
        {selectedAssignment && (
          <Dialog
            open={!!selectedAssignment}
            onClose={handleCloseAssignmentDetails}
            fullWidth
            maxWidth="md"
            PaperProps={{
              sx: {
                backgroundColor: darkModeStyles.dialogBg,
                color: darkModeStyles.color,
              }
            }}
          >
            <DialogTitle sx={{
              color: darkModeStyles.color,
              fontWeight: darkModeStyles.fontWeight
            }}>
              {selectedAssignment.title}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{
                color: darkModeStyles.color,
                fontWeight: darkModeStyles.fontWeight
              }}>
                <strong>Description:</strong> {selectedAssignment.description}
              </Typography>
              <Typography variant="body1" sx={{
                color: darkModeStyles.color,
                fontWeight: darkModeStyles.fontWeight
              }}>
                <strong>Due Date:</strong> {new Date(selectedAssignment.dueDate).toLocaleDateString()}
              </Typography>

              <Typography variant="h6" sx={{
                mt: 2,
                color: darkModeStyles.color,
                fontWeight: darkModeStyles.fontWeight
              }}>
                Student Submissions
              </Typography>
              {selectedAssignment.submissions?.length > 0 ? (
                <List>
                  {selectedAssignment.submissions.map((submission) => (
                    <ListItem key={submission._id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Box sx={{
                        width: '100%',
                        p: 1,
                        border: `1px solid ${darkModeStyles.borderColor}`,
                        borderRadius: 1,
                        backgroundColor: darkModeStyles.paperBg,
                        mb: 1
                      }}>
                        <Typography variant="body2" sx={{
                          fontWeight: 'bold',
                          color: darkModeStyles.color,
                          fontWeight: darkModeStyles.fontWeight
                        }}>
                          {submission.student?.email || "test@example.com"}
                        </Typography>
                        <Typography variant="body2" sx={{
                          color: darkModeStyles.textSecondary,
                          fontWeight: darkModeStyles.fontWeight
                        }}>
                          Submitted on: {new Date(submission.submittedAt).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'row',
                          gap: 1,
                          overflowX: 'auto',
                          whiteSpace: 'nowrap',
                          py: 1,
                          px: 2,
                          border: `1px solid ${darkModeStyles.borderColor}`,
                          borderRadius: 1,
                          backgroundColor: darkModeStyles.paperBg,
                          '&::-webkit-scrollbar': {
                            height: '8px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: appTheme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                            borderRadius: '4px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            backgroundColor: appTheme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                            borderRadius: '4px',
                          },
                        }}
                      >
                        {submission.files?.length > 0 ? (
                          submission.files.map((file, index) => (
                            <a
                              key={index}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none', flex: '0 0 auto' }}
                            >
                              <Chip
                                avatar={
                                  <Avatar>
                                    <DescriptionIcon />
                                  </Avatar>
                                }
                                label={file.filename}
                                clickable
                                color="primary"
                                variant="outlined"
                              />
                            </a>
                          ))
                        ) : (
                          <Typography variant="body2" sx={{
                            color: darkModeStyles.textSecondary,
                            fontWeight: darkModeStyles.fontWeight
                          }}>
                            No files submitted
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        {submission.grade ? (
                          <>
                            <Typography variant="body2" sx={{
                              fontWeight: "bold",
                              color: "green",
                              fontWeight: darkModeStyles.fontWeight
                            }}>
                              Grade: {submission.grade.grade}/100
                            </Typography>
                            <IconButton
                              sx={{ ml: 1 }}
                              onClick={() => handleOpenEditDialog(submission)}
                            >
                              <EditIcon />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <Typography variant="body2" sx={{
                              color: "red",
                              fontWeight: darkModeStyles.fontWeight
                            }}>
                              Not graded yet
                            </Typography>
                            <IconButton
                              sx={{ ml: 1 }}
                              onClick={() => handleOpenEditDialog(submission)}
                            >
                              <EditIcon />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{
                  color: darkModeStyles.textSecondary,
                  fontWeight: darkModeStyles.fontWeight
                }}>
                  No submissions available for this assignment.
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseAssignmentDetails}
                sx={{
                  ...buttonStyles,
                  fontWeight: darkModeStyles.fontWeight
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </Container>
  ); 
}