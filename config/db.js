const mongoose = require("mongoose");

// ==========================================
// Connect MongoDB
// ==========================================
const connectDB = async () => {
    try {
        // ------------------------------------------
        // Validate MongoDB URI
        // ------------------------------------------
        if (!process.env.MONGODB_URI) {
            throw new Error(
                "MONGODB_URI is not defined in the environment."
            );
        }

        // ------------------------------------------
        // Connect to MongoDB
        // ------------------------------------------
        const conn = await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log(
            `✅ MongoDB Connected: ${conn.connection.name}`
        );

    } catch (error) {
        console.error(
            "❌ MongoDB Connection Failed"
        );

        console.error(
            "Message:",
            error.message
        );

        process.exit(1);
    }
};

// ==========================================
// Export
// ==========================================

module.exports = connectDB;