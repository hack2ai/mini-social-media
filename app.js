const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const {
    rateLimit,
} = require("express-rate-limit");

// ==========================================
// Routes
// ==========================================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const followRoutes = require("./routes/followRoutes");
const feedRoutes = require("./routes/feedRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// ==========================================
// Environment
// ==========================================

const isProduction =
    process.env.NODE_ENV === "production";

// ==========================================
// Rate Limiting
// ==========================================
//
// Global limiter: protects the API from excessive traffic.
// Authentication limiter: stricter protection for login/register.
// Mutation limiter: protects write-heavy endpoints.
//
const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message:
            "Too many requests. Please try again later.",
    },
});

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message:
            "Too many authentication attempts. Please try again later.",
    },
});

const mutationRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message:
            "Too many write requests. Please try again later.",
    },
});

// ==========================================
// Trust Proxy
// ==========================================

// Trust a single reverse proxy only in production.
// In local development, do not trust forwarded client IP headers.
if (isProduction) {
    app.set("trust proxy", 1);
} else {
    app.set("trust proxy", false);
}

// ==========================================
// Global API Rate Limit
// ==========================================

app.use(
    "/api",
    globalRateLimiter
);

// ==========================================
// Request Debug Logger
// ==========================================

app.use((req, res, next) => {
    console.log(
        `[REQUEST] ${req.method} ${req.originalUrl} | Content-Type: ${
            req.headers["content-type"] || "none"
        }`
    );

    next();
});

// ==========================================
// Security - Helmet
// ==========================================
//
// Important:
// Cloudinary is allowed for post/profile images.
// localhost development remains HTTP.
// ==========================================

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin",
        },

        contentSecurityPolicy: {
            directives: {
                // Default
                "default-src": ["'self'"],

                // HTML base URL
                "base-uri": ["'self'"],

                // Forms
                "form-action": ["'self'"],

                // Frames
                "frame-ancestors": ["'self'"],

                // Images
                // IMPORTANT: Cloudinary is explicitly allowed.
                "img-src": [
                    "'self'",
                    "data:",
                    "blob:",
                    "https://res.cloudinary.com",
                ],

                // JavaScript
                "script-src": [
                    "'self'",
                ],

                "script-src-attr": [
                    "'none'",
                ],

                // CSS
                "style-src": [
                    "'self'",
                    "'unsafe-inline'",
                    "https:",
                ],

                // Fonts
                "font-src": [
                    "'self'",
                    "https:",
                    "data:",
                ],

                // API / fetch / XHR / WebSocket
                "connect-src": [
                    "'self'",
                ],

                // Objects/plugins
                "object-src": [
                    "'none'",
                ],

                // Do not force HTTP localhost to HTTPS.
                ...(isProduction
                    ? {
                          "upgrade-insecure-requests": [],
                      }
                    : {}),
            },
        },
    })
);

// ==========================================
// CORS
// ==========================================
//
// Development:
// Allow local frontend/API communication.
//
// Production:
// Restrict this to your actual frontend URL
// through FRONTEND_URL.
// ==========================================

const corsOptions = {
    origin: isProduction
        ? process.env.FRONTEND_URL || false
        : true,

    credentials: true,

    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
    ],
};

app.use(cors(corsOptions));

// ==========================================
// General Middleware
// ==========================================

app.use(compression());

app.use(
    morgan(
        isProduction
            ? "combined"
            : "dev"
    )
);

app.use(cookieParser());

// ==========================================
// Body Parsers
// ==========================================
//
// JSON requests
// application/json
//
// URL encoded requests
// application/x-www-form-urlencoded
//
// multipart/form-data is handled by Multer
// inside the upload/post routes.
// ==========================================

app.use(
    express.json({
        limit: "10mb",
    })
);

app.use(
    express.urlencoded({
        extended: false,
        limit: "1mb",
        parameterLimit: 100,
    })
);

// ==========================================
// Static Frontend
// ==========================================

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);

// ==========================================
// API Routes
// ==========================================

// Authentication

app.use(
    "/api/auth",
    authRateLimiter,
    authRoutes
);

// Users

app.use(
    "/api/users",
    userRoutes
);

// Posts

app.use(
    "/api/posts",
    mutationRateLimiter,
    postRoutes
);

// Comments

app.use(
    "/api/comments",
    mutationRateLimiter,
    commentRoutes
);

// Follow / Unfollow

app.use(
    "/api/follow",
    mutationRateLimiter,
    followRoutes
);

// Feed

app.use(
    "/api/feed",
    feedRoutes
);

// Image Upload

app.use(
    "/api/upload",
    mutationRateLimiter,
    uploadRoutes
);

// Notifications

app.use(
    "/api/notifications",
    notificationRoutes
);

// ==========================================
// Frontend Entry Point
// ==========================================
//
// Browser:
// http://localhost:5000/
// ==========================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );
});

// ==========================================
// API Health Check
// ==========================================

app.get(
    "/api/health",
    (req, res) => {
        return res.status(200).json({
            success: true,
            message: "API is healthy",
            timestamp:
                new Date().toISOString(),
            environment:
                process.env.NODE_ENV ||
                "development",
        });
    }
);

// ==========================================
// API 404 Handler
// ==========================================

app.use(
    "/api",
    (req, res) => {
        return res.status(404).json({
            success: false,
            message:
                "API route not found.",
            method: req.method,
        });
    }
);

// ==========================================
// Global 404 Handler
// ==========================================

app.use(
    (req, res) => {
        return res.status(404).json({
            success: false,
            message:
                "Route not found.",
            method: req.method,
        });
    }
);

// ==========================================
// Global Error Handler
// ==========================================

app.use(
    (err, req, res, next) => {
        console.error(
            "===================================="
        );

        console.error(
            "GLOBAL ERROR"
        );

        console.error(
            "Message:",
            err.message
        );

        console.error(
            "Name:",
            err.name
        );

        console.error(
            "Code:",
            err.code
        );

        console.error(
            "Stack:",
            err.stack
        );

        console.error(
            "===================================="
        );

        // ======================================
        // Multer Errors
        // ======================================

        if (
            err.name === "MulterError"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Upload error: ${err.message}`,
                code: err.code,
            });
        }

        // ======================================
        // File Type Validation
        // ======================================

        if (
            err.message &&
            err.message.includes(
                "Only JPG, JPEG, PNG and WEBP"
            )
        ) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }

        // ======================================
        // Invalid JSON
        // ======================================

        if (
            err instanceof SyntaxError &&
            err.status === 400 &&
            err.type ===
                "entity.parse.failed"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid JSON request body.",
            });
        }

        // ======================================
        // Request Too Large
        // ======================================

        if (
            err.status === 413 ||
            err.type ===
                "entity.too.large"
        ) {
            return res.status(413).json({
                success: false,
                message:
                    "Request payload is too large.",
            });
        }

        // ======================================
        // Cloudinary Error
        // ======================================

        if (
            err.http_code &&
            err.name === "Error"
        ) {
            return res.status(
                Number.isInteger(err.http_code)
                    ? err.http_code
                    : 502
            ).json({
                success: false,
                message:
                    isProduction
                        ? "Cloudinary request failed."
                        : (
                              err.message ||
                              "Cloudinary request failed."
                          ),
            });
        }

        // ======================================
        // Default Error
        // ======================================

        const statusCode =
            err.status ||
            err.statusCode ||
            500;

        const safeStatusCode =
            Number.isInteger(statusCode) &&
            statusCode >= 400 &&
            statusCode <= 599
                ? statusCode
                : 500;

        return res.status(
            safeStatusCode
        ).json({
            success: false,
            message:
                isProduction
                    ? "Internal Server Error"
                    : (
                          err.message ||
                          "Internal Server Error"
                      ),

            ...(isProduction
                ? {}
                : {
                      stack: err.stack,
                  }),
        });
    }
);

// ==========================================
// Export
// ==========================================

module.exports = app;