const express = require("express");

const router = express.Router();

const protect =
    require("../middlewares/authMiddleware");

const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} =
    require("../controllers/notificationController");


// ==========================================
// Get notifications
// GET /api/notifications
// Protected
// ==========================================

router.get(
    "/",
    protect,
    getNotifications
);


// ==========================================
// Get unread count
// GET /api/notifications/unread-count
// Protected
// ==========================================

router.get(
    "/unread-count",
    protect,
    getUnreadCount
);


// ==========================================
// Mark one as read
// PUT /api/notifications/:id/read
// Protected
// ==========================================

router.put(
    "/:id/read",
    protect,
    markAsRead
);


// ==========================================
// Mark all as read
// PUT /api/notifications/read-all
// Protected
// ==========================================

router.put(
    "/read-all",
    protect,
    markAllAsRead
);


module.exports = router;