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
    console.error("GET ALL USERS ERROR:", error);

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
    console.error("GET PROFILE ERROR:", error);

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

    // Only update fields that were actually provided.
    if (name !== undefined) {
      const trimmedName = String(name).trim();

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty.",
        });
      }

      user.name = trimmedName;
    }

    if (bio !== undefined) {
      user.bio = String(bio).trim();
    }

    if (profilePicture !== undefined) {
      user.profilePicture = String(profilePicture).trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile.",
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

    // Validate MongoDB ObjectId first
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
    console.error("GET USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get user.",
    });
  }
};