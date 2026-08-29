const multer = require("multer");

// ==========================================
// Memory Storage
// ==========================================
const storage = multer.memoryStorage();

// ==========================================
// Allowed Image Types
// ==========================================
const allowedTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// ==========================================
// File Filter
// ==========================================
const fileFilter = (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      ),
      false
    );
  }

  cb(null, true);
};

// ==========================================
// Multer Configuration
// ==========================================
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});

module.exports = upload;