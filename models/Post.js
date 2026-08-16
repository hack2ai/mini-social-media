const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    // ==========================================
    // Author
    // ==========================================
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // Caption
    // ==========================================
    caption: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    // ==========================================
    // Cloudinary Image URL
    // ==========================================
    image: {
      type: String,
      default: "",
    },

    // ==========================================
    // Cloudinary Public ID
    // Used for deleting/replacing images
    // ==========================================
    imagePublicId: {
      type: String,
      default: "",
    },

    // ==========================================
    // Likes
    // ==========================================
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ==========================================
    // Comments Count
    // ==========================================
    commentsCount: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model("Post", postSchema);