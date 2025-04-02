const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const { verifyToken } = require('../middleware/authMiddleware');

//POST change password 
router.post('/change-password', verifyToken, async (req, res) => {
    try {
      let { currentPassword, newPassword } = req.body;
  
      currentPassword = currentPassword.trim();
      newPassword = newPassword.trim();
  
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      const isMatch = await bcrypt.compare(currentPassword, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password.' });
      }
  
      user.password = newPassword;
  
      await user.save();
  
      const updatedUser = await User.findById(user._id);
  
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to change password.' });
    }
  });
  
  


// POST Register route
router.post("/register", async (req, res) => {
    const { email, password, role } = req.body;

    if (!role || (role !== "student" && role !== "lecturer")) {
        return res.status(400).json({ message: "Role is required and must be either 'student' or 'lecturer'" });
    }

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        user = new User({ email, password, role });

        if (role === "student") {
            user.courses = [];
        }

        await user.save();

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

//POST login route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        if (user.isTwoFactorEnabled) {
            req.session.tempUserId = user._id;
            return res.status(200).json({
                message: "2FA required",
                twoFactorRequired: true,
                tempUserId: user._id
            });
        }

        const tokenPayload = { _id: user._id, role: user.role };
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error("JWT_SECRET is missing from environment!");
            return res.status(500).json({ message: "JWT secret not configured." });
        }

        const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '1h' });
        req.session.userId = user._id;

        res.status(200).json({ message: "Login successful", token, role: user.role });

    } catch (err) {
        console.error("Login error caught:", err);
        res.status(500).json({ message: "Login failed", error: err.message });
    }
});


// 2FA login verification route
router.post('/2fa/login/verify', async (req, res) => {
    const { token } = req.body;
    const tempUserId = req.session.tempUserId;

    if (!tempUserId) {
        return res.status(401).json({ message: "No pending 2FA session" });
    }

    try {
        const user = await User.findById(tempUserId);
        if (!user || !user.twoFactorSecret) {
            return res.status(400).json({ message: "Invalid 2FA user or secret" });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token
        });

        if (!verified) {
            return res.status(400).json({ message: "Invalid 2FA code" });
        }

        req.session.userId = user._id;
        delete req.session.tempUserId;

        const jwtToken = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: "2FA verification successful", token: jwtToken, role: user.role });

    } catch (error) {
        console.error("2FA login error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
