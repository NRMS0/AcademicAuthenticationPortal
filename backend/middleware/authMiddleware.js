const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    let token = req.header('Authorization');

    if (!token) {
        console.warn("Unauthorized access attempt: No token provided");
        return res.status(401).json({ message: "Access Denied: No token provided" });
    }

    token = token.replace(/^Bearer\s+/i, "");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token Verified:", decoded);

        req.user = decoded; 
        next();
    } catch (error) {
        console.warn("Invalid Token:", error.message);
        return res.status(401).json({ message: "Invalid Token" });
    }
};

// Middleware to check if user is a Lecturer
const isLecturer = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'lecturer') {
            console.warn(`Access Denied: User ${req.user?.email || "Unknown"} is not a lecturer`);
            return res.status(403).json({ message: "Access Denied: Requires Lecturer Role" });
        }
        next();
    } catch (error) {
        console.error("Error in role verification:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Middleware for session-based auth (used in 2FA routes)
const isSessionAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ message: "Unauthorized: No session" });
};

module.exports = {
    verifyToken,
    isLecturer,
    isSessionAuthenticated 
};
