const express = require("express");

const router = express.Router();

const { register } = require("../controllers/authController");

const {
  registerValidator,
} = require("../validators/authValidator");

router.post(
  "/register",
  registerValidator,
  register
);

module.exports = router;