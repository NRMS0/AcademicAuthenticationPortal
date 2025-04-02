const express = require('express');
const User = require('../models/User');
const { verifyToken, isLecturer } = require('../middleware/authMiddleware');

const router = express.Router();


//Get all students (For Lecturer to enroll)
router.get('/students', verifyToken, isLecturer, async (req, res) => {
    try {
        console.log("🔹 Fetching all students...");
        const students = await User.find({ role: "student" }).select("_id email");

        if (!students.length) {
            console.log("No students found in the database.");
            return res.json([]);
        }

        console.log("Students fetched:", students);
        res.json(students);
    } catch (error) {
        console.error("Error fetching students:", error.message);
        res.status(500).json({ message: "Error fetching students", error: error.message });
    }
});

//Get current user's profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('email role isTwoFactorEnabled');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error.message);
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

module.exports = router;
