const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = require('../multerConfig'); 
const upload = multer({ storage });

//Handle file uploads
router.post('/upload', upload.single('file'), (req, res) => {
  console.log('Uploaded file info:', req.file);

  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: 'No file uploaded or upload failed' });
  }

  res.status(200).json({
    message: 'File uploaded successfully',
    url: req.file.path,
    filename: req.file.filename, 
  });
});

module.exports = router;
