import multer from "multer";
import path from 'path';

// simple storage (save in uploads folder with original name)
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    // Add timestamp to avoid duplicate filenames
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export default upload;