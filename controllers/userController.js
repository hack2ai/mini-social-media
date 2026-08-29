const mongoose = require("mongoose");
const User = require("../models/User");

// ==========================================
// Get All Users
// GET /api/users
// Public
// ==========================================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get users.",
    });
  }
};

// ==========================================
// Get Logged-in User Profile
// GET /api/users/profile
// Protected
// ==========================================
exports.getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get profile.",
    });
  }
};

// ==========================================
// Update Logged-in User Profile
// PUT /api/users/profile
// Protected
// ==========================================
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, profilePicture } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (name !== undefined) {
      if (typeof name !== "string") {
        return res.status(400).json({
          success: false,
          message: "Name must be a string.",
        });
      }

      const trimmedName = name.trim();

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty.",
        });
      }

      if (trimmedName.length < 3 || trimmedName.length > 50) {
        return res.status(400).json({
          success: false,
          message: "Name must be between 3 and 50 characters.",
        });
      }

      user.name = trimmedName;
    }

    if (bio !== undefined) {
      if (typeof bio !== "string") {
        return res.status(400).json({
          success: false,
          message: "Bio must be a string.",
        });
      }

      const trimmedBio = bio.trim();

      if (trimmedBio.length > 250) {
        return res.status(400).json({
          success: false,
          message: "Bio cannot exceed 250 characters.",
        });
      }

      user.bio = trimmedBio;
    }

    if (profilePicture !== undefined) {
      if (typeof profilePicture !== "string") {
        return res.status(400).json({
          success: false,
          message: "Profile picture must be a string.",
        });
      }

      const trimmedProfilePicture = profilePicture.trim();

      if (trimmedProfilePicture.length > 2048) {
        return res.status(400).json({
          success: false,
          message: "Profile picture URL is too long.",
        });
      }

      user.profilePicture = trimmedProfilePicture;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: await User.findById(user._id).select("-password"),
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
};

// ==========================================
// Get Public User Profile
// GET /api/users/:id
// Public
// ==========================================
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET USER ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get user.",
    });
  }
};