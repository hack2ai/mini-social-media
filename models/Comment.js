const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    // ==========================================
    // Post Reference
    // ==========================================
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },

    // ==========================================
    // User Reference
    // ==========================================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // Comment Text
    // ==========================================
    text: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },

    // ==========================================
    // Edited Status
    // ==========================================
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// Index for fetching post comments quickly
// ==========================================
commentSchema.index({ post: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);