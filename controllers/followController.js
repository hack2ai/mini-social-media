const mongoose = require("mongoose");

const Follow = require("../models/Follow");
const User = require("../models/User");
const Notification = require("../models/Notification");

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

exports.followUser = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        const followerId = req.user._id;
        const followingId = req.params.id;

        if (!isValidObjectId(followingId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }

        if (followerId.toString() === followingId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow yourself.",
            });
        }

        const targetUser = await User.findById(followingId).select(
            "_id name email profilePicture followersCount followingCount isActive"
        );

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (!targetUser.isActive) {
            return res.status(403).json({
                success: false,
                message: "This account is inactive.",
            });
        }

        const existingFollow = await Follow.findOne({
            follower: followerId,
            following: followingId,
        });

        if (existingFollow) {
            return res.status(400).json({
                success: false,
                message: "Already following this user.",
            });
        }

        let follow;

        try {
            follow = await Follow.create({
                follower: followerId,
                following: followingId,
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: "Already following this user.",
                });
            }
            throw error;
        }

        await Promise.all([
            User.findByIdAndUpdate(followerId, {
                $inc: { followingCount: 1 },
            }),
            User.findByIdAndUpdate(followingId, {
                $inc: { followersCount: 1 },
            }),
        ]);

        try {
            const followerUser = await User.findById(followerId).select(
                "_id name profilePicture"
            );

            if (followerUser) {
                const existingUnreadFollowNotification =
                    await Notification.findOne({
                        recipient: followingId,
                        sender: followerId,
                        type: "follow",
                        isRead: false,
                    });

                if (!existingUnreadFollowNotification) {
                    await Notification.create({
                        recipient: followingId,
                        sender: followerId,
                        type: "follow",
                        message: `${followerUser.name} started following you.`,
                    });
                }
            }
        } catch (notificationError) {
            console.error(
                "FOLLOW NOTIFICATION ERROR:",
                notificationError.message
            );
        }

        return res.status(201).json({
            success: true,
            message: "User followed successfully.",
            follow: {
                _id: follow._id,
                follower: follow.follower,
                following: follow.following,
                createdAt: follow.createdAt,
            },
        });
    } catch (error) {
        console.error("FOLLOW ERROR:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to follow user.",
        });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        const followerId = req.user._id;
        const followingId = req.params.id;

        if (!isValidObjectId(followingId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }

        const relation = await Follow.findOne({
            follower: followerId,
            following: followingId,
        });

        if (!relation) {
            return res.status(404).json({
                success: false,
                message: "Follow relationship not found.",
            });
        }

        await relation.deleteOne();

        await Promise.all([
            User.findOneAndUpdate(
                { _id: followerId, followingCount: { $gt: 0 } },
                { $inc: { followingCount: -1 } }
            ),
            User.findOneAndUpdate(
                { _id: followingId, followersCount: { $gt: 0 } },
                { $inc: { followersCount: -1 } }
            ),
        ]);

        try {
            await Notification.deleteMany({
                recipient: followingId,
                sender: followerId,
                type: "follow",
                isRead: false,
            });
        } catch (notificationError) {
            console.error(
                "UNFOLLOW NOTIFICATION CLEANUP ERROR:",
                notificationError.message
            );
        }

        return res.status(200).json({
            success: true,
            message: "User unfollowed successfully.",
            following: false,
        });
    } catch (error) {
        console.error("UNFOLLOW ERROR:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to unfollow user.",
        });
    }
};

exports.getFollowers = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }

        const user = await User.findById(userId).select("_id");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const followers = await Follow.find({ following: userId })
            .populate(
                "follower",
                "name email profilePicture followersCount followingCount"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: followers.length,
            followers,
        });
    } catch (error) {
        console.error("GET FOLLOWERS ERROR:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to get followers.",
        });
    }
};

exports.getFollowing = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }

        const user = await User.findById(userId).select("_id");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const following = await Follow.find({ follower: userId })
            .populate(
                "following",
                "name email profilePicture followersCount followingCount"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: following.length,
            following,
        });
    } catch (error) {
        console.error("GET FOLLOWING ERROR:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to get following list.",
        });
    }
};