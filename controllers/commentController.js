const mongoose = require("mongoose");

const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");

// ==========================================
// Helper: Validate MongoDB ObjectId
// ==========================================

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};


// ==========================================
// Add Comment
// POST /api/comments/posts/:id/comments
// Protected
// ==========================================

exports.addComment = async (
    req,
    res
) => {
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

        const { text } =
            req.body;

        // ------------------------------------------
        // Validate comment text
        // ------------------------------------------

        if (
            typeof text !== "string" ||
            !text.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Comment text is required.",
            });
        }

        const trimmedText =
            text.trim();

        if (
            trimmedText.length > 500
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Comment cannot exceed 500 characters.",
            });
        }

        // ------------------------------------------
        // Validate Post ID
        // ------------------------------------------

        if (
            !isValidObjectId(
                req.params.id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid post ID.",
            });
        }

        // ------------------------------------------
        // Find Post
        // ------------------------------------------

        const post =
            await Post.findById(
                req.params.id
            );

        if (!post) {
            return res.status(404).json({
                success: false,
                message:
                    "Post not found.",
            });
        }

        // ------------------------------------------
        // Create Comment
        // ------------------------------------------

        const comment =
            await Comment.create({
                post:
                    post._id,

                user:
                    req.user._id,

                text:
                    trimmedText,
            });

        // ------------------------------------------
        // Increment comments count
        // ------------------------------------------

        await Post.findByIdAndUpdate(
            post._id,
            {
                $inc: {
                    commentsCount: 1,
                },
            }
        );

        // ------------------------------------------
        // Create Comment Notification
        // ------------------------------------------
        //
        // Do not notify a user when they comment
        // on their own post.
        // ------------------------------------------

        const commenterId =
            req.user._id.toString();

        const postOwnerId =
            post.author.toString();

        if (
            commenterId !==
            postOwnerId
        ) {
            try {
                const commenter =
                    await User.findById(
                        req.user._id
                    ).select(
                        "_id name email profilePicture"
                    );

                if (commenter) {
                    await Notification.create({
                        recipient:
                            post.author,

                        sender:
                            req.user._id,

                        type:
                            "comment",

                        post:
                            post._id,

                        comment:
                            comment._id,

                        message:
                            `${commenter.name} commented on your post.`,
                    });
                }

            } catch (
                notificationError
            ) {
                // Notification failure should not
                // make the comment operation fail.
                console.error(
                    "COMMENT NOTIFICATION ERROR:",
                    notificationError
                );
            }
        }

        // ------------------------------------------
        // Populate comment
        // ------------------------------------------

        const populatedComment =
            await Comment.findById(
                comment._id
            )
                .populate(
                    "user",
                    "name email profilePicture"
                )
                .populate(
                    "post",
                    "caption"
                );

        // ------------------------------------------
        // Response
        // ------------------------------------------

        return res.status(201).json({
            success: true,
            message:
                "Comment added successfully.",
            comment:
                populatedComment,
        });

    } catch (error) {
        console.error(
            "ADD COMMENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to add comment.",
        });
    }
};


// ==========================================
// Get Comments
// GET /api/comments/posts/:id/comments
// Public
// ==========================================

exports.getComments = async (
    req,
    res
) => {
    try {
        // ------------------------------------------
        // Validate Post ID
        // ------------------------------------------

        if (
            !isValidObjectId(
                req.params.id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid post ID.",
            });
        }

        // ------------------------------------------
        // Verify Post Exists
        // ------------------------------------------

        const post =
            await Post.findById(
                req.params.id
            ).select("_id");

        if (!post) {
            return res.status(404).json({
                success: false,
                message:
                    "Post not found.",
            });
        }

        // ------------------------------------------
        // Get Comments
        // ------------------------------------------

        const comments =
            await Comment.find({
                post:
                    req.params.id,
            })
                .populate(
                    "user",
                    "name email profilePicture"
                )
                .sort({
                    createdAt: -1,
                });

        return res.status(200).json({
            success: true,
            count:
                comments.length,
            comments,
        });

    } catch (error) {
        console.error(
            "GET COMMENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to get comments.",
        });
    }
};


// ==========================================
// Get Single Comment
// GET /api/comments/:id
// Public
// ==========================================

exports.getCommentById = async (
    req,
    res
) => {
    try {
        // ------------------------------------------
        // Validate Comment ID
        // ------------------------------------------

        if (
            !isValidObjectId(
                req.params.id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid comment ID.",
            });
        }

        // ------------------------------------------
        // Find Comment
        // ------------------------------------------

        const comment =
            await Comment.findById(
                req.params.id
            )
                .populate(
                    "user",
                    "name email profilePicture"
                )
                .populate(
                    "post",
                    "caption"
                );

        if (!comment) {
            return res.status(404).json({
                success: false,
                message:
                    "Comment not found.",
            });
        }

        return res.status(200).json({
            success: true,
            comment,
        });

    } catch (error) {
        console.error(
            "GET COMMENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to get comment.",
        });
    }
};


// ==========================================
// Update Comment
// PUT /api/comments/:id
// Protected
// ==========================================

exports.updateComment = async (
    req,
    res
) => {
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

        const { text } =
            req.body;

        // ------------------------------------------
        // Validate Comment ID
        // ------------------------------------------

        if (
            !isValidObjectId(
                req.params.id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid comment ID.",
            });
        }

        // ------------------------------------------
        // Validate Text
        // ------------------------------------------

        if (
            typeof text !== "string" ||
            !text.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Comment text is required.",
            });
        }

        const trimmedText =
            text.trim();

        if (
            trimmedText.length > 500
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Comment cannot exceed 500 characters.",
            });
        }

        // ------------------------------------------
        // Find Comment
        // ------------------------------------------

        const comment =
            await Comment.findById(
                req.params.id
            );

        if (!comment) {
            return res.status(404).json({
                success: false,
                message:
                    "Comment not found.",
            });
        }

        // ------------------------------------------
        // Ownership Check
        // ------------------------------------------

        if (
            comment.user.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to update this comment.",
            });
        }

        // ------------------------------------------
        // Update
        // ------------------------------------------

        comment.text =
            trimmedText;

        comment.isEdited =
            true;

        await comment.save();

        // ------------------------------------------
        // Populate Response
        // ------------------------------------------

        const updatedComment =
            await Comment.findById(
                comment._id
            )
                .populate(
                    "user",
                    "name email profilePicture"
                )
                .populate(
                    "post",
                    "caption"
                );

        return res.status(200).json({
            success: true,
            message:
                "Comment updated successfully.",
            comment:
                updatedComment,
        });

    } catch (error) {
        console.error(
            "UPDATE COMMENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to update comment.",
        });
    }
};


// ==========================================
// Delete Comment
// DELETE /api/comments/:id
// Protected
// ==========================================

exports.deleteComment = async (
    req,
    res
) => {
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

        // ------------------------------------------
        // Validate Comment ID
        // ------------------------------------------

        if (
            !isValidObjectId(
                req.params.id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid comment ID.",
            });
        }

        // ------------------------------------------
        // Find Comment
        // ------------------------------------------

        const comment =
            await Comment.findById(
                req.params.id
            );

        if (!comment) {
            return res.status(404).json({
                success: false,
                message:
                    "Comment not found.",
            });
        }

        // ------------------------------------------
        // Ownership Check
        // ------------------------------------------

        if (
            comment.user.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to delete this comment.",
            });
        }

        // ------------------------------------------
        // Delete Comment
        // ------------------------------------------

        await comment.deleteOne();

        // ------------------------------------------
        // Decrease commentsCount safely
        // ------------------------------------------

        await Post.findByIdAndUpdate(
            comment.post,
            {
                $inc: {
                    commentsCount: -1,
                },
            }
        );

        // ------------------------------------------
        // Prevent negative commentsCount
        // ------------------------------------------

        await Post.findOneAndUpdate(
            {
                _id:
                    comment.post,

                commentsCount: {
                    $lt: 0,
                },
            },
            {
                $set: {
                    commentsCount: 0,
                },
            }
        );

        return res.status(200).json({
            success: true,
            message:
                "Comment deleted successfully.",
        });

    } catch (error) {
        console.error(
            "DELETE COMMENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to delete comment.",
        });
    }
};