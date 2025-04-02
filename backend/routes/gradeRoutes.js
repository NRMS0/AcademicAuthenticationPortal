const express = require('express');
const router = express.Router();
const Grade = require('../models/Grade');
const Submission = require('../models/Submission');
const { verifyToken, isLecturer } = require('../middleware/authMiddleware');

// Add or update a grade to a submission (Lecturer only)
router.post('/:submissionId', verifyToken, isLecturer, async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { grade, feedback } = req.body;
        const gradedBy = req.user._id;

        if (grade < 0 || grade > 100) {
            return res.status(400).json({ message: 'Grade must be between 0 and 100' });
        }

        const submission = await Submission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        let existingGrade = await Grade.findOne({ submission: submissionId });

        if (existingGrade) {
            existingGrade.grade = grade;
            existingGrade.feedback = feedback;
            existingGrade.gradedBy = gradedBy;
            await existingGrade.save();
            
            if (!submission.grade) {
                submission.grade = existingGrade._id;
                await submission.save();
            }
            
            return res.status(200).json({ message: 'Grade updated successfully', grade: existingGrade });
        } else {
            // Create a new grade
            const newGrade = new Grade({
                submission: submissionId,
                student: submission.student,
                assignment: submission.assignment,
                grade,
                feedback,
                gradedBy,
            });

            await newGrade.save();
            
            submission.grade = newGrade._id;
            await submission.save();

            return res.status(201).json({ message: 'Grade added successfully', grade: newGrade });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error adding/updating grade', error: error.message });
    }
});

// Get grade for a specific assignment and student
router.get('/assignment/:assignmentId/student/:studentId', verifyToken, async (req, res) => {
    try {
        const { assignmentId, studentId } = req.params;
        
        const submission = await Submission.findOne({ 
            assignment: assignmentId,
            student: studentId
        });
        
        if (!submission) {
            return res.status(404).json({ message: 'No submission found' });
        }
        
        const grade = await Grade.findOne({ submission: submission._id })
            .populate('gradedBy', 'name email');
            
        if (!grade) {
            return res.status(404).json({ message: 'No grade found for this submission' });
        }

        res.json(grade);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching grade', error: error.message });
    }
});

// Get all grades for the logged-in student
router.get('/student/grades', verifyToken, async (req, res) => {
    try {
        const studentId = req.user._id;
        
        const grades = await Grade.find({ student: studentId })
            .populate({
                path: 'assignment',
                select: 'title dueDate course',
                populate: { path: 'course', select: 'name' }
            })
            .populate('gradedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student grades', error: error.message });
    }
});

// Get grade for a specific submission
router.get('/:submissionId', verifyToken, async (req, res) => {
    try {
        const { submissionId } = req.params;
        const grade = await Grade.findOne({ submission: submissionId })
            .populate('gradedBy', 'name email');
            
        if (!grade) {
            return res.status(404).json({ message: 'Grade not found for this submission' });
        }

        res.json(grade);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching grade', error: error.message });
    }
});

// Get all grades for a specific assignment (Lecturer only)
router.get('/assignment/:assignmentId', verifyToken, isLecturer, async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const grades = await Grade.find({ assignment: assignmentId })
            .populate('student', 'name email')
            .populate('gradedBy', 'name email')
            .sort({ grade: -1 });
            
        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching grades for assignment', error: error.message });
    }
});

module.exports = router;