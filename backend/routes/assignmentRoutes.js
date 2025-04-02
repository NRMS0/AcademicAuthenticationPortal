const express = require('express');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const { verifyToken, isLecturer } = require('../middleware/authMiddleware');

const router = express.Router();

// Create an assignment (Lecturer only)
router.post('/', verifyToken, isLecturer, async (req, res) => {
  try {
    const { title, description, dueDate, courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const assignment = new Assignment({
      title,
      description,
      dueDate,
      course: courseId,
    });

    await assignment.save();

    course.assignments.push(assignment._id);
    await course.save();

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: "Error creating assignment", error: error.message });
  }
});

// Get all assignments for a specific course
router.get('/', verifyToken, async (req, res) => {
  try {
    const { courseId } = req.query;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const assignments = await Assignment.find({ course: courseId }).populate('course');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assignments", error: error.message });
  }
});

// Mark an assignment as completed
router.put('/:id/complete', verifyToken, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    assignment.completed = true;
    await assignment.save();

    res.json({ message: "Assignment marked as completed" });
  } catch (error) {
    res.status(500).json({ message: "Error updating assignment", error: error.message });
  }
});

// Delete an assignment (Lecturer only)
router.delete('/:courseId/assignments/:assignmentId', verifyToken, isLecturer, async (req, res) => {
  try {
    const { courseId, assignmentId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    course.assignments = course.assignments.filter((a) => a.toString() !== assignmentId);
    await course.save();


    await Assignment.findByIdAndDelete(assignmentId);

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting assignment", error: error.message });
  }
});

module.exports = router;