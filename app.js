const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");

// Routes
const authRoutes = require("./routes/authRoutes");

const app = express();

/*
|--------------------------------------------------------------------------
| Security Middleware
|--------------------------------------------------------------------------
*/
app.use(helmet());

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| Middlewares
|--------------------------------------------------------------------------
*/
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Static Files
|--------------------------------------------------------------------------
*/
app.use(express.static(path.join(__dirname, "public")));

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
app.use("/api/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Mini Social Media API Running Successfully 🚀",
    version: "1.0.0",
  });
});

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

module.exports = app;