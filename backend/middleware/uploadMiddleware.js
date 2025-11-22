const multer = require('multer');
const path = require('path');

// Configure multer for in-memory storage (files are processed immediately)
const storage = multer.memoryStorage();

// File filter to accept only images and videos
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}`), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});

// Middleware to handle multiple files and convert them to base64
const handleFileUpload = (req, res, next) => {
  const uploadMultiple = upload.array('media', 10); // Max 10 files

  uploadMultiple(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        error: err.message || 'File upload failed'
      });
    }

    if (req.files && req.files.length > 0) {
      // Convert uploaded files to base64 for processing
      req.body.media = req.files.map(file => {
        const base64Data = file.buffer.toString('base64');
        const mimeType = file.mimetype;
        
        return {
          type: mimeType.startsWith('image/') ? 'image' : 'video',
          url: `data:${mimeType};base64,${base64Data}`,
          originalName: file.originalname,
          size: file.size
        };
      });

      console.log(`✅ Processed ${req.body.media.length} files for upload`);
    }

    next();
  });
};

module.exports = {
  upload,
  handleFileUpload
};
