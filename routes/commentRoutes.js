const express = require("express");

const router = express.Router();

const protect = require("../middlewares/authMiddleware");

const {
  addComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

// ==========================================
// Comment Routes
// ==========================================

// ------------------------------------------
// Add Comment
// POST /api/comments/posts/:id/comments
// Protected
// ------------------------------------------
router.post(
  "/posts/:id/comments",
  protect,
  addComment
);

// ------------------------------------------
// Get Comments of a Post
// GET /api/comments/posts/:id/comments
// Public
// ------------------------------------------
router.get(
  "/posts/:id/comments",
  getComments
);

// ------------------------------------------
// Get Single Comment
// GET /api/comments/:id
// Public
// ------------------------------------------
router.get(
  "/:id",
  getCommentById
);

// ------------------------------------------
// Update Comment
// PUT /api/comments/:id
// Protected
// ------------------------------------------
router.put(
  "/:id",
  protect,
  updateComment
);

// ------------------------------------------
// Delete Comment
// DELETE /api/comments/:id
// Protected
// ------------------------------------------
router.delete(
  "/:id",
  protect,
  deleteComment
);

module.exports = router;