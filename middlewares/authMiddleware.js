const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    // ==========================================
    // Get Authorization Header
    // ==========================================
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authorization header is missing.",
      });
    }

    // Expected format:
    // Authorization: Bearer <JWT>
    const parts = authHeader.trim().split(/\s+/);

    if (
      parts.length !== 2 ||
      parts[0].toLowerCase() !== "bearer" ||
      !parts[1]
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format. Use Bearer <token>.",
      });
    }

    const token = parts[1];

    // ==========================================
    // Verify JWT
    // ==========================================
    if (!process.env.JWT_SECRET) {
      console.error("AUTH ERROR: JWT_SECRET is not configured.");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ==========================================
    // TEMPORARY AUTH DEBUG
    // ==========================================
    console.log("========================================");
    console.log("AUTH DEBUG");
    console.log("JWT decoded:", decoded);
    console.log("JWT user ID:", decoded.id);
    console.log("========================================");

    // ==========================================
    // Validate JWT Payload
    // ==========================================
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    // ==========================================
    // Find User
    // ==========================================
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User associated with this token was not found.",
      });
    }

    // ==========================================
    // Attach User To Request
    // ==========================================
    req.user = user;

    // ==========================================
    // TEMPORARY AUTH DEBUG
    // ==========================================
    console.log("AUTH USER:", {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    });

    console.log("========================================");

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);

    // JWT-specific errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

module.exports = protect;