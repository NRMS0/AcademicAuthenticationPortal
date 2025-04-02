const express = require('express');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const { verifyToken, isLecturer } = require('../middleware/authMiddleware');
const { publicCourseProjection } = require('../utils/projections');

const router = express.Router();

// GET all courses (Public)
router.get('/', async (req, res) => {
    try {
        console.log("🔹 Fetching all courses...");
        const courses = await Course.find()
            .select('name description difficulty duration')
            .lean();

        res.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error.message);
        res.status(500).json({ message: "Error fetching courses", error: error.message });
    }
});

// GET all public courses 
router.get('/public', async (req, res) => {
    try {
        console.log("🔹 Fetching public courses...");
        const courses = await Course.find({ isPublic: true })
            .select('name description difficulty duration learningObjectives prerequisites assignments')
            .populate('assignments', 'title dueDate')
            .lean();

        // Transform the data for public view excluding sensitive information
        const publicCourses = courses.map(course => ({
            _id: course._id,
            name: course.name,
            description: course.description,
            difficulty: course.difficulty,
            duration: course.duration,
            learningObjectives: course.learningObjectives || [],
            prerequisites: course.prerequisites || [],
            assignmentCount: course.assignments?.length || 0
        }));

        res.json(publicCourses);
    } catch (error) {
        console.error("Error fetching public courses:", error.message);
        res.status(500).json({ message: "Error fetching public courses", error: error.message });
    }
});


// GET courses for a logged-in student
router.get('/student', verifyToken, async (req, res) => {
    try {
        console.log("🔹 Fetching courses for student ID:", req.user._id);

        const courses = await Course.find({ students: req.user._id })
            .populate('lecturer', 'email')
            .populate('assignments');

        res.json(courses);
    } catch (error) {
        console.error("Error fetching student courses:", error.message);
        res.status(500).json({ message: "Error fetching student courses", error: error.message });
    }
});

// GET a specific course by ID
router.get('/:id', async (req, res) => {
    console.log("🔹 Fetching course with ID:", req.params.id);

    try {
        const course = await Course.findById(req.params.id)
            .populate('lecturer', 'email')
            .populate('students', 'email')
            .populate('assignments');

        if (!course) return res.status(404).json({ message: "Course not found" });

        res.json(course);
    } catch (error) {
        console.error("Error fetching course:", error.message);
        res.status(500).json({ message: "Error fetching course details", error: error.message });
    }
});

// GET all users enrolled in a specific course (Protected)
router.get('/:courseId/users', verifyToken, async (req, res) => {
    try {
        const { courseId } = req.params;

        console.log(`🔹 Fetching users for course: ${courseId}`);

        // Validate course existence
        const course = await Course.findById(courseId).populate('students', 'name email');
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json({ success: true, users: course.students });
    } catch (error) {
        console.error("Error fetching enrolled users:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// POST - Enroll students in a course (Lecturer only)
router.post('/:id/enroll', verifyToken, isLecturer, async (req, res) => {
    try {
        const { students } = req.body;
        const courseId = req.params.id;

        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ message: "At least one student ID is required." });
        }

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        let enrolledCount = 0;
        students.forEach((studentId) => {
            if (!course.students.includes(studentId)) {
                course.students.push(studentId);
                enrolledCount++;
            }
        });

        await course.save();
        res.status(200).json({ message: `Enrolled ${enrolledCount} new students!` });
    } catch (error) {
        console.error("Error enrolling students:", error.message);
        res.status(500).json({ message: "Error enrolling students", error: error.message });
    }
});

// POST - Unenroll students from a course (Lecturer only)
router.post('/:courseId/unenroll', verifyToken, isLecturer, async (req, res) => {
    try {
        const { students } = req.body;
        const { courseId } = req.params;

        if (!Array.isArray(students)) {
            return res.status(400).json({ message: "Students must be an array." });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        // Remove the students from the course
        course.students = course.students.filter((studentId) => !students.includes(studentId.toString()));
        await course.save();

        res.status(200).json({ message: "Students unenrolled successfully!" });
    } catch (error) {
        console.error("Error unenrolling students:", error.message);
        res.status(500).json({ message: "Error unenrolling students", error: error.message });
    }
});

// POST - Create a new course (Lecturer only)
router.post('/', verifyToken, isLecturer, async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: "Course name is required." });

        const newCourse = new Course({
            name,
            description,
            lecturer: req.user._id,
            students: [],
            assignments: []
        });

        await newCourse.save();
        res.status(201).json({ message: "Course created successfully!", course: newCourse });
    } catch (error) {
        console.error("Error creating course:", error.message);
        res.status(500).json({ message: "Error creating course", error: error.message });
    }
});

// PUT - Edit an existing course (Lecturer only)
router.put('/:id', verifyToken, isLecturer, async (req, res) => {
    try {
        const { name, description } = req.body;
        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, { name, description }, { new: true });

        if (!updatedCourse) return res.status(404).json({ message: "Course not found" });

        res.json({ message: "Course updated successfully!", course: updatedCourse });
    } catch (error) {
        console.error("Error updating course:", error.message);
        res.status(500).json({ message: "Error updating course", error: error.message });
    }
});

// DELETE - Delete a course (Lecturer only)
router.delete('/:id', verifyToken, isLecturer, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });

        await Assignment.deleteMany({ course: course._id });
        await course.deleteOne();

        res.json({ message: "Course deleted successfully!" });
    } catch (error) {
        console.error("Error deleting course:", error.message);
        res.status(500).json({ message: "Error deleting course", error: error.message });
    }
});

// GET courses for a specific student (Lecturer only)
router.get('/student/:studentId', verifyToken, isLecturer, async (req, res) => {
    const { studentId } = req.params;
    try {
        const courses = await Course.find({ students: studentId })
            .populate('lecturer', 'email')
            .populate('assignments');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST - Add an assignment to a course (Lecturer only)
router.post('/:id/assignments', verifyToken, isLecturer, async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;
        const courseId = req.params.id;

        if (!title || !dueDate) return res.status(400).json({ message: "Title and Due Date are required." });

        const newAssignment = new Assignment({ title, description, dueDate, course: courseId });

        await newAssignment.save();
        await Course.findByIdAndUpdate(courseId, { $push: { assignments: newAssignment._id } });

        res.status(201).json({ message: "Assignment added successfully!", assignment: newAssignment });
    } catch (error) {
        console.error("Error adding assignment:", error.message);
        res.status(500).json({ message: "Error adding assignment", error: error.message });
    }
});

module.exports = router;