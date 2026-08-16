const express = require("express");
const router = express.Router();

// Controllers
const authController = require("../controllers/authController");

// Validators
const authValidator = require("../validators/authValidator");

// ==========================
// DEBUG (Temporary)
// ==========================
console.log("========== AUTH ROUTES DEBUG ==========");
console.log("register:", typeof authController.register);
console.log("login:", typeof authController.login);
console.log("registerValidator:", Array.isArray(authValidator.registerValidator));
console.log("loginValidator:", Array.isArray(authValidator.loginValidator));
console.log("======================================");

// ==========================
// Register
// ==========================
router.post(
  "/register",
  authValidator.registerValidator,
  authController.register
);

// ==========================
// Login
// ==========================
router.post(
  "/login",
  authValidator.loginValidator,
  authController.login
);

module.exports = router;