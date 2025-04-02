const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');

// Load variables from .env file
dotenv.config();

//Clooudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Multer storage configuration for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads',
    resource_type: 'auto',
    // Specify the allowed formats for upload
    allowed_formats: ['jpg', 'png', 'pdf', 'docx', 'xlsx', 'pptx'],
    // The filename will be a combination of the original name and a timestamp
    public_id: (req, file) => {
      const originalName = path.parse(file.originalname).name.replace(/\s+/g, '_');
      const timestamp = Date.now();
      return `${originalName}-${timestamp}`;
    },
    format: async (req, file) => {
      const extension = path.extname(file.originalname).replace('.', '');
      return extension || 'pdf';
    },
  },
});

module.exports = storage;