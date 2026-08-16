const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        // ==========================================
        // User who receives the notification
        // ==========================================
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // ==========================================
        // User who caused the notification
        // ==========================================
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // ==========================================
        // Notification type
        // ==========================================
        type: {
            type: String,
            enum: [
                "follow",
                "like",
                "comment",
            ],
            required: true,
        },

        // ==========================================
        // Related Post
        // Used for like/comment notifications
        // ==========================================
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default: null,
        },

        // ==========================================
        // Related Comment
        // Used for comment notifications
        // ==========================================
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
        },

        // ==========================================
        // Notification message
        // ==========================================
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },

        // ==========================================
        // Read / unread state
        // ==========================================
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// ======================================================
// Main notification feed
// recipient = current user
// newest notifications first
// ======================================================
notificationSchema.index({
    recipient: 1,
    createdAt: -1,
});

// ======================================================
// Unread notification count
// recipient = current user
// isRead = false
// ======================================================
notificationSchema.index({
    recipient: 1,
    isRead: 1,
});

// ======================================================
// Optional type-filtered notification queries
// ======================================================
notificationSchema.index({
    recipient: 1,
    type: 1,
    createdAt: -1,
});

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);