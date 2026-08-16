const express = require("express");

const router = express.Router();

const protect = require("../middlewares/authMiddleware");

const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} = require("../controllers/followController");

// ==========================================
// Protected Routes
// ==========================================

// Follow user
router.post("/:id", protect, followUser);

// Unfollow user
router.delete("/:id", protect, unfollowUser);

// ==========================================
// Public Routes
// ==========================================

// Get followers
router.get("/followers/:id", getFollowers);

// Get following
router.get("/following/:id", getFollowing);

module.exports = router;