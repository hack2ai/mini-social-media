const express = require("express");

const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { uploadImage } = require("../controllers/uploadController");

// ======================================================
// TEST ROUTE
// GET /api/upload/test
// ======================================================

router.get("/test", (req, res) => {
    console.log("================================");
    console.log("GET /api/upload/test HIT");
    console.log("================================");

    res.status(200).json({
        success: true,
        message: "Upload route is working",
    });
});

// ======================================================
// IMAGE UPLOAD
// POST /api/upload/image
// ======================================================

router.post(
    "/image",

    // --------------------------------------------------
    // STEP 1: Request reaches route
    // --------------------------------------------------
    (req, res, next) => {
        console.log("\n================================");
        console.log("STEP 1 - IMAGE ROUTE REACHED");
        console.log("================================");

        console.log("Method:", req.method);
        console.log("URL:", req.originalUrl);
        console.log(
            "Content-Type:",
            req.headers["content-type"] || "NOT PROVIDED"
        );
        console.log(
            "Content-Length:",
            req.headers["content-length"] || "NOT PROVIDED"
        );

        next();
    },

    // --------------------------------------------------
    // STEP 2: Authentication
    // --------------------------------------------------
    protect,

    (req, res, next) => {
        console.log("\n================================");
        console.log("STEP 2 - AUTHENTICATION PASSED");
        console.log("================================");

        console.log("User:", req.user);

        next();
    },

    // --------------------------------------------------
    // STEP 3: Multer
    // --------------------------------------------------
    upload.single("image"),

    (req, res, next) => {
        console.log("\n================================");
        console.log("STEP 3 - MULTER FINISHED");
        console.log("================================");

        console.log("Content-Type:", req.headers["content-type"]);
        console.log("req.file:", req.file);
        console.log("req.body:", req.body);

        // No file received
        if (!req.file) {
            console.log("❌ NO FILE RECEIVED");

            return res.status(400).json({
                success: false,
                message: "No image received",
                debug: {
                    expectedField: "image",
                    receivedFile: false,
                    contentType:
                        req.headers["content-type"] || null,
                },
            });
        }

        // File received
        console.log("✅ FILE RECEIVED");
        console.log("Field:", req.file.fieldname);
        console.log("Original Name:", req.file.originalname);
        console.log("MIME Type:", req.file.mimetype);
        console.log("Size:", req.file.size);

        next();
    },

    // --------------------------------------------------
    // STEP 4: Controller
    // --------------------------------------------------
    (req, res, next) => {
        console.log("\n================================");
        console.log("STEP 4 - CONTROLLER");
        console.log("================================");

        console.log("Passing request to uploadImage...");

        next();
    },

    uploadImage
);

// ======================================================
// MULTER / UPLOAD ERROR HANDLER
// ======================================================

router.use((err, req, res, next) => {
    console.error("\n================================");
    console.error("UPLOAD ROUTE ERROR");
    console.error("================================");

    console.error("Error:", err);

    if (err && err.message) {
        console.error("Message:", err.message);
    }

    return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
    });
});

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;