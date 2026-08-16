const express = require("express");

const router = express.Router();

const protect = require("../middlewares/authMiddleware");

const {
  getFeed,
} = require("../controllers/feedController");

// Home Feed
router.get("/", protect, getFeed);

module.exports = router;