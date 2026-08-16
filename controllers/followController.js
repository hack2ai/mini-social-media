const mongoose = require("mongoose");

const Follow = require("../models/Follow");
const User = require("../models/User");
const Notification = require("../models/Notification");

// ==========================================
// Helper: Validate MongoDB ObjectId
// ==========================================

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};


// ==========================================
// Follow User
// POST /api/follow/:id
// Protected
// ==========================================

exports.followUser = async (req, res) => {
    try {
        // ------------------------------------------
        // Authentication check
        // ------------------------------------------
        if (
            !req.user ||
            !req.user._id
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required.",
            });
        }

        const followerId =
            req.user._id;

        const followingId =
            req.params.id;


        // ------------------------------------------
        // Validate target user ID
        // ------------------------------------------

        if (
            !isValidObjectId(
                followingId
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }


        // ------------------------------------------
        // Prevent self-follow
        // ------------------------------------------

        if (
            followerId.toString() ===
            followingId.toString()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot follow yourself.",
            });
        }


        // ------------------------------------------
        // Check target user
        // ------------------------------------------

        const targetUser =
            await User.findById(
                followingId
            ).select(
                "_id name email profilePicture followersCount followingCount"
            );

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }


        // ------------------------------------------
        // Check existing relationship
        // ------------------------------------------

        const existingFollow =
            await Follow.findOne({
                follower: followerId,
                following: followingId,
            });

        if (existingFollow) {
            return res.status(400).json({
                success: false,
                message:
                    "Already following this user.",
            });
        }


        // ------------------------------------------
        // Create follow relationship
        // ------------------------------------------

        let follow;

        try {
            follow =
                await Follow.create({
                    follower: followerId,
                    following: followingId,
                });

        } catch (error) {

            // MongoDB duplicate-key protection
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Already following this user.",
                });
            }

            throw error;
        }


        // ------------------------------------------
        // Update follower/following counters
        // ------------------------------------------

        await Promise.all([
            User.findByIdAndUpdate(
                followerId,
                {
                    $inc: {
                        followingCount: 1,
                    },
                }
            ),

            User.findByIdAndUpdate(
                followingId,
                {
                    $inc: {
                        followersCount: 1,
                    },
                }
            ),
        ]);


        // ------------------------------------------
        // Create follow notification
        // ------------------------------------------

        try {
            const followerUser =
                await User.findById(
                    followerId
                ).select(
                    "_id name email profilePicture"
                );

            if (followerUser) {

                const existingUnreadFollowNotification =
                    await Notification.findOne({
                        recipient:
                            followingId,

                        sender:
                            followerId,

                        type:
                            "follow",

                        isRead:
                            false,
                    });

                if (!existingUnreadFollowNotification) {
                    await Notification.create({
                        recipient:
                            followingId,

                        sender:
                            followerId,

                        type:
                            "follow",

                        message:
                            `${followerUser.name} started following you.`,
                    });
                }
            }

        } catch (
            notificationError
        ) {

            // Notification failure should not
            // make the Follow operation fail.
            console.error(
                "FOLLOW NOTIFICATION ERROR:",
                notificationError
            );
        }


        // ------------------------------------------
        // Response
        // ------------------------------------------

        return res.status(201).json({
            success: true,
            message:
                "User followed successfully.",

            follow: {
                _id:
                    follow._id,

                follower:
                    follow.follower,

                following:
                    follow.following,

                createdAt:
                    follow.createdAt,
            },
        });

    } catch (error) {

        console.error(
            "FOLLOW ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to follow user.",
        });
    }
};


// ==========================================
// Unfollow User
// DELETE /api/follow/:id
// Protected
// ==========================================

exports.unfollowUser = async (req, res) => {
    try {
        // ------------------------------------------
        // Authentication check
        // ------------------------------------------
        if (
            !req.user ||
            !req.user._id
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required.",
            });
        }

        const followerId =
            req.user._id;

        const followingId =
            req.params.id;


        // ------------------------------------------
        // Validate target user ID
        // ------------------------------------------

        if (
            !isValidObjectId(
                followingId
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }


        // ------------------------------------------
        // Find relationship
        // ------------------------------------------

        const relation =
            await Follow.findOne({
                follower: followerId,
                following: followingId,
            });

        if (!relation) {
            return res.status(404).json({
                success: false,
                message:
                    "Follow relationship not found.",
            });
        }


        // ------------------------------------------
        // Delete relationship
        // ------------------------------------------

        await relation.deleteOne();


        // ------------------------------------------
        // Decrease counters
        // ------------------------------------------

        await Promise.all([
            User.findByIdAndUpdate(
                followerId,
                {
                    $inc: {
                        followingCount: -1,
                    },
                }
            ),

            User.findByIdAndUpdate(
                followingId,
                {
                    $inc: {
                        followersCount: -1,
                    },
                }
            ),
        ]);

        // ------------------------------------------
        // Remove stale unread follow notification
        // ------------------------------------------
        try {
            await Notification.deleteMany({
                recipient:
                    followingId,

                sender:
                    followerId,

                type:
                    "follow",

                isRead:
                    false,
            });
        } catch (notificationError) {
            // Notification cleanup must not make a successful
            // unfollow operation fail.
            console.error(
                "UNFOLLOW NOTIFICATION CLEANUP ERROR:",
                notificationError
            );
        }


        // ------------------------------------------
        // Response
        // ------------------------------------------

        return res.status(200).json({
            success: true,
            message:
                "User unfollowed successfully.",
            following: false,
        });

    } catch (error) {

        console.error(
            "UNFOLLOW ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to unfollow user.",
        });
    }
};


// ==========================================
// Get Followers
// GET /api/follow/followers/:id
// Public
// ==========================================

exports.getFollowers = async (
    req,
    res
) => {
    try {
        const userId =
            req.params.id;


        // ------------------------------------------
        // Validate user ID
        // ------------------------------------------

        if (
            !isValidObjectId(
                userId
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }


        // ------------------------------------------
        // Check user exists
        // ------------------------------------------

        const user =
            await User.findById(
                userId
            ).select("_id");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }


        // ------------------------------------------
        // Get followers
        // ------------------------------------------

        const followers =
            await Follow.find({
                following: userId,
            })
                .populate(
                    "follower",
                    "name email profilePicture followersCount followingCount"
                )
                .sort({
                    createdAt: -1,
                });


        // ------------------------------------------
        // Response
        // ------------------------------------------

        return res.status(200).json({
            success: true,
            count:
                followers.length,
            followers,
        });

    } catch (error) {

        console.error(
            "GET FOLLOWERS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to get followers.",
        });
    }
};


// ==========================================
// Get Following
// GET /api/follow/following/:id
// Public
// ==========================================

exports.getFollowing = async (
    req,
    res
) => {
    try {
        const userId =
            req.params.id;


        // ------------------------------------------
        // Validate user ID
        // ------------------------------------------

        if (
            !isValidObjectId(
                userId
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }


        // ------------------------------------------
        // Check user exists
        // ------------------------------------------

        const user =
            await User.findById(
                userId
            ).select("_id");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }


        // ------------------------------------------
        // Get following
        // ------------------------------------------

        const following =
            await Follow.find({
                follower: userId,
            })
                .populate(
                    "following",
                    "name email profilePicture followersCount followingCount"
                )
                .sort({
                    createdAt: -1,
                });


        // ------------------------------------------
        // Response
        // ------------------------------------------

        return res.status(200).json({
            success: true,
            count:
                following.length,
            following,
        });

    } catch (error) {

        console.error(
            "GET FOLLOWING ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to get following list.",
        });
    }
};