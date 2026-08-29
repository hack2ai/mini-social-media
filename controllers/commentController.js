const mongoose = require("mongoose");

const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

exports.addComment = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        const { text } = req.body;

        if (typeof text !== "string" || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment text is required.",
            });
        }

        const trimmedText = text.trim();

        if (trimmedText.length > 500) {
            return res.status(400).json({
                success: false,
                message: "Comment cannot exceed 500 characters.",
            });
        }

        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID.",
            });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found.",
            });
        }

        const comment = await Comment.create({
            post: post._id,
            user: req.user._id,
            text: trimmedText,
        });

        await Post.findByIdAndUpdate(post._id, {
            $inc: { commentsCount: 1 },
        });

        const commenterId = req.user._id.toString();
        const postOwnerId = post.author.toString();

        if (commenterId !== postOwnerId) {
            try {
                const commenter = await User.findById(req.user._id).select(
                    "_id name profilePicture"
                );

                if (commenter) {
                    await Notification.create({
                        recipient: post.author,
                        sender: req.user._id,
                        type: "comment",
                        post: post._id,
                        comment: comment._id,
                        message: `${commenter.name} commented on your post.`,
                    });
                }
            } catch (notificationError) {
                console.error(
                    "COMMENT NOTIFICATION ERROR:",
                    notificationError.message
                );
            }
        }

        const populatedComment = await Comment.findById(comment._id)
            .populate("user", "name email profilePicture")
            .populate("post", "caption");

        return res.status(201).json({
            success: true,
            message: "Comment added successfully.",
            comment: populatedComment,
        });
    } catch (error) {
        console.error("ADD COMMENT ERROR:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to add comment.",
        });
    }
};

exports.getComments = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID.",
            });
        }

        const post = await Post.findById(req.params.id).select("_id");

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found.",
            });
        }

        const comments = await Comment.find({ post: req.params.id })
            .populate("user", "name email profilePicture")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: comments.length,
            comments,
        });
    } catch (error) {
        console.error("GET COMMENTS ERROR:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to get comments.",
        });
    }
};

exports.getCommentById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid comment ID.",
            });
        }

        const comment = await Comment.findById(req.params.id)
            .populate("user", "name email profilePicture")
            .populate("post", "caption");

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found.",
            });
        }

        return res.status(200).json({
            success: true,
            comment,
        });
    } catch (error) {
        console.error("GET COMMENT ERROR:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to get comment.",
        });
    }
};

exports.updateComment = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        const { text } = req.body;

        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid comment ID.",
            });
        }

        if (typeof text !== "string" || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment text is required.",
            });
        }

        const trimmedText = text.trim();

        if (trimmedText.length > 500) {
            return res.status(400).json({
                success: false,
                message: "Comment cannot exceed 500 characters.",
            });
        }

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found.",
            });
        }

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this comment.",
            });
        }

        comment.text = trimmedText;
        comment.isEdited = true;
        await comment.save();

        const updatedComment = await Comment.findById(comment._id)
            .populate("user", "name email profilePicture")
            .populate("post", "caption");

        return res.status(200).json({
            success: true,
            message: "Comment updated successfully.",
            comment: updatedComment,
        });
    } catch (error) {
        console.error("UPDATE COMMENT ERROR:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to update comment.",
        });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid comment ID.",
            });
        }

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found.",
            });
        }

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this comment.",
            });
        }

        await comment.deleteOne();

        await Post.findOneAndUpdate(
            { _id: comment.post, commentsCount: { $gt: 0 } },
            { $inc: { commentsCount: -1 } }
        );

        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully.",
        });
    } catch (error) {
        console.error("DELETE COMMENT ERROR:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to delete comment.",
        });
    }
};