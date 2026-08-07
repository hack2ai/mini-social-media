const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { validationResult } = require("express-validator");

exports.register = async (req, res) => {
  try {
    console.log("Incoming Request Body:", req.body);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("========== REGISTER ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};