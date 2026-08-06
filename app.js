const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Mini Social Media API Running Successfully 🚀",
    version: "1.0.0",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

module.exports = app;