const express = require("express");

const router = express.Router();

const protect = require("../middlewares/authMiddleware");

const {
  getAllUsers,
  getProfile,
  updateProfile,
  getUserById,
} = require("../controllers/userController");

// ==========================================
// User Routes
// ==========================================

// Get all users
// GET /api/users
router.get("/", getAllUsers);

// Logged-in user profile
// GET /api/users/profile
router.get("/profile", protect, getProfile);

// Update logged-in user profile
// PUT /api/users/profile
router.put("/profile", protect, updateProfile);

// Public user profile
// GET /api/users/:id
router.get("/:id", getUserById);

module.exports = router;