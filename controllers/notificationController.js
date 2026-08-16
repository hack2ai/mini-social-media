const mongoose = require("mongoose");

const Notification = require("../models/Notification");

// ==========================================
// Helper: Validate MongoDB ObjectId
// ==========================================
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// ==========================================
// Helper: Parse Pagination
// ==========================================
const parsePagination = (req) => {
    const rawPage = Number.parseInt(req.query.page, 10);
    const rawLimit = Number.parseInt(req.query.limit, 10);

    const page =
        Number.isInteger(rawPage) && rawPage > 0
            ? rawPage
            : 1;

    // Keep the API safe from excessively large queries.
    const limit =
        Number.isInteger(rawLimit) && rawLimit > 0
            ? Math.min(rawLimit, 50)
            : 20;

    const skip = (page - 1) * limit;

    return {
        page,
        limit,
        skip,
    };
};

// ==========================================
// Get Notifications
// GET /api/notifications?page=1&limit=20
// Protected
// ==========================================
exports.getNotifications = async (req, res) => {
    try {
        const recipientId = req.user._id;

        const { page, limit, skip } =
            parsePagination(req);

        // ------------------------------------------
        // Count total notifications
        // ------------------------------------------
        const totalCount =
            await Notification.countDocuments({
                recipient: recipientId,
            });

        // ------------------------------------------
        // Fetch current page
        // ------------------------------------------
        const notifications =
            await Notification.find({
                recipient: recipientId,
            })
                .populate(
                    "sender",
                    "name email profilePicture"
                )
                .populate(
                    "post",
                    "_id caption image"
                )
                .populate(
                    "comment",
                    "_id text"
                )
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
                .lean();

        const totalPages =
            totalCount === 0
                ? 0
                : Math.ceil(
                      totalCount / limit
                  );

        return res.status(200).json({
            success: true,

            // Backward-compatible page count.
            count: notifications.length,

            notifications,

            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNextPage:
                    page < totalPages,
                hasPreviousPage:
                    page > 1 && totalPages > 0,
            },
        });
    } catch (error) {
        console.error(
            "GET NOTIFICATIONS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to get notifications.",
        });
    }
};

// ==========================================
// Get Unread Notification Count
// GET /api/notifications/unread-count
// Protected
// ==========================================
exports.getUnreadCount = async (req, res) => {
    try {
        const recipientId =
            req.user._id;

        const count =
            await Notification.countDocuments({
                recipient: recipientId,
                isRead: false,
            });

        return res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        console.error(
            "GET UNREAD COUNT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to get unread notification count.",
        });
    }
};

// ==========================================
// Mark One Notification As Read
// PUT /api/notifications/:id/read
// Protected
// ==========================================
exports.markAsRead = async (req, res) => {
    try {
        const notificationId =
            req.params.id;

        if (
            !isValidObjectId(
                notificationId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid notification ID.",
            });
        }

        const notification =
            await Notification.findOne({
                _id: notificationId,
                recipient:
                    req.user._id,
            });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message:
                    "Notification not found.",
            });
        }

        notification.isRead = true;

        await notification.save();

        return res.status(200).json({
            success: true,
            message:
                "Notification marked as read.",
            notification,
        });
    } catch (error) {
        console.error(
            "MARK NOTIFICATION READ ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to mark notification as read.",
        });
    }
};

// ==========================================
// Mark All Notifications As Read
// PUT /api/notifications/read-all
// Protected
// ==========================================
exports.markAllAsRead = async (req, res) => {
    try {
        const result =
            await Notification.updateMany(
                {
                    recipient:
                        req.user._id,
                    isRead: false,
                },
                {
                    $set: {
                        isRead: true,
                    },
                }
            );

        return res.status(200).json({
            success: true,
            message:
                "All notifications marked as read.",
            modifiedCount:
                result.modifiedCount || 0,
        });
    } catch (error) {
        console.error(
            "MARK ALL NOTIFICATIONS READ ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to mark all notifications as read.",
        });
    }
};