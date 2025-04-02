const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Cloudinary config
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    // Name of the folder in Cloudinary
    folder: 'uploads', 
    // Allowed files
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'docx'],
  },
});

const parser = multer({ storage });

module.exports = parser;