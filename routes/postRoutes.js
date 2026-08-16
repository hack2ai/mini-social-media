const express = require("express");

const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
} = require("../controllers/postController");

// ==========================================
// CREATE POST
// Supports:
// - caption only
// - image only
// - caption + image
// ==========================================
router.post(
  "/",
  protect,
  upload.single("image"),
  createPost
);

// ==========================================
// GET ALL POSTS
// ==========================================
router.get(
  "/",
  protect,
  getAllPosts
);

// ==========================================
// GET SINGLE POST
// ==========================================
router.get(
  "/:id",
  protect,
  getPostById
);

// ==========================================
// LIKE / UNLIKE POST
// ==========================================
router.put(
  "/:id/like",
  protect,
  likePost
);

// ==========================================
// UPDATE POST
// Supports:
// - caption only
// - image replacement
// - caption + image replacement
// ==========================================
router.put(
  "/:id",
  protect,
  upload.single("image"),
  updatePost
);

// ==========================================
// DELETE POST
// ==========================================
router.delete(
  "/:id",
  protect,
  deletePost
);

module.exports = router;