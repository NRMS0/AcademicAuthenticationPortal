const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const path = require('path');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const originalName = path.parse(file.originalname).name.replace(/\s+/g, '_');
    const timestamp = Date.now();
    const extension = path.extname(file.originalname).substring(1); // no dot

    return {
      folder: 'assignments',
      resource_type: 'auto',
      public_id: `${originalName}-${timestamp}`,
      format: extension,
    };
  },
});

//Multer middleware with Cloudinary storage
const upload = multer({ storage });

//Submit assignment with file upload, one or multiple files
router.post('/submit', verifyToken, upload.array('files', 10), async (req, res) => {
  try {
    const { assignmentId } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const fileUrls = req.files.map(file => ({
      url: file.path,
      filename: file.filename,
    }));

    const submission = new Submission({
      student: req.user._id,
      assignment: assignmentId,
      files: fileUrls,
    });

    await submission.save();
    res.status(201).json({ message: 'Assignment submitted successfully', submission });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//Get student submissions
router.get('/student', verifyToken, async (req, res) => {
  try {
    const query = { student: req.user._id };
    if (req.query.assignmentId) {
      query.assignment = req.query.assignmentId;
    }

    const submissions = await Submission.find(query)
      .populate('assignment', 'title course dueDate') 
      .populate('gradeDetails', 'grade feedback')
      .lean({ virtuals: true }); 
      console.log("Example populated submission:", submissions[0]);
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
  }
});

//Get submissions for an assignment
router.get('/assignment/:assignmentId', verifyToken, async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name email')
      .populate('gradeDetails');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch assignment submissions', error: error.message });
  }
});



module.exports = router;