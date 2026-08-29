const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");

const {
    uploadToCloudinary,
    deleteFromCloudinary,
} = require("../utils/cloudinaryUpload");

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

const isPostOwner = (post, userId) => {
    return post.author.toString() === userId.toString();
};

const syncUserPostCount = async (userId) => {
    const postsCount = await Post.countDocuments({ author: userId });

    await User.findByIdAndUpdate(userId, {
        $set: { postsCount },
    });

    return postsCount;
};

exports.createPost = async (req, res) => {
    let uploadedPublicId = "";
    let createdPostId = null;

    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        const caption =
            typeof req.body.caption === "string"
                ? req.body.caption.trim()
                : "";

        if (!caption && !req.file) {
            return res.status(400).json({
                success: false,
                message: "Post must contain a caption or an image.",
            });
        }

        let imageUrl = "";
        let imagePublicId = "";

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, {
                folder: "mini-social-media/posts",
                resource_type: "image",
            });

            if (!result || !result.secure_url || !result.public_id) {
                throw new Error("Cloudinary image upload failed.");
            }

            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
            uploadedPublicId = result.public_id;
        }

        const post = await Post.create({
            author: req.user._id,
            caption,
            image: imageUrl,
            imagePublicId,
        });

        createdPostId = post._id;
        await syncUserPostCount(req.user._id);

        await post.populate("author", "name email profilePicture");

        return res.status(201).json({
            success: true,
            message: "Post created successfully.",
            post,
        });
    } catch (error) {
        console.error("CREATE POST ERROR:", error.message);

        if (createdPostId) {
            try {
                await Post.findByIdAndDelete(createdPostId);
            } catch (cleanupPostError) {
                console.error(
                    "MONGODB POST CLEANUP ERROR:",
                    cleanupPostError.message
                );
            }
        }

        if (uploadedPublicId) {
            try {
                await deleteFromCloudinary(uploadedPublicId);
            } catch (cleanupError) {
                console.error(
                    "CLOUDINARY CLEANUP ERROR:",
                    cleanupError.message
                );
            }
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create post.",
        });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "name email profilePicture")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: posts.length,
            posts,
        });
    } catch (error) {
        console.error("GET POSTS ERROR:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to get posts.",
        });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID.",
            });
        }

        const post = await Post.findById(id).populate(
            "author",
            "name email profilePicture"
        );

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found.",
            });
        }

        return res.status(200).json({
            success: true,
            post,
        });
    } catch (error) {
        console.error("GET POST ERROR:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to get post.",
        });
    }
};

exports.updatePost = async (req, res) => {
    let newUploadedPublicId = "";

    try {
        const { id } = req.params;

        const caption =
            typeof req.body.caption === "string"
                ? req.body.caption.trim()
                : undefined;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID.",
            });
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found.",
            });
        }

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        if (!isPostOwner(post, req.user._id)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this post.",
            });
        }

        if (caption === undefined && !req.file) {
            return res.status(400).json({
                success: false,
                message: "Provide a caption or image to update.",
            });
        }

        const oldImagePublicId = post.imagePublicId;
        let newImageUrl = post.image;
        let newImagePublicId = oldImagePublicId;

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, {
                folder: "mini-social-media/posts",
                resource_type: "image",
            });

            if (!result || !result.secure_url || !result.public_id) {
                throw new Error("Cloudinary image upload failed.");
            }

            newImageUrl = result.secure_url;
            newImagePublicId = result.public_id;
            newUploadedPublicId = result.public_id;
        }

        if (caption !== undefined) {
            post.caption = caption;
        }

        if (req.file) {
            post.image = newImageUrl;
            post.imagePublicId = newImagePublicId;
        }

        post.isEdited = true;
        await post.save();
        newUploadedPublicId = "";

        if (
            req.file &&
            oldImagePublicId &&
            oldImagePublicId !== newImagePublicId
        ) {
            try {
                await deleteFromCloudinary(oldImagePublicId);
            } catch (deleteError) {
                console.error(
                    "OLD IMAGE DELETE ERROR:",
                    deleteError.message
                );
            }
        }

        await post.populate("author", "name email profilePicture");

        return res.status(200).json({
            success: true,
            message: "Post updated successfully.",
            post,
        });
    } catch (error) {
        console.error("UPDATE POST ERROR:", error.message);

        if (newUploadedPublicId) {
            try {
                await deleteFromCloudinary(newUploadedPublicId);
            } catch (cleanupError) {
                console.error(
                    "NEW IMAGE CLEANUP ERROR:",
                    cleanupError.message
                );
            }
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update post.",
        });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID.",
            });
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found.",
            });
        }

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        if (!isPostOwner(post, req.user._id)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this post.",
            });
        }

        const authorId = post.author;

        if (post.imagePublicId) {
            try {
                await deleteFromCloudinary(post.imagePublicId);
            } catch (cloudinaryError) {
                console.error(
                    "CLOUDINARY DELETE ERROR:",
                    cloudinaryError.message
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Post was not deleted because the associated image could not be removed.",
                });
            }
        }

        await post.deleteOne();
        await syncUserPostCount(authorId);

        return res.status(200).json({
            success: true,
            message: "Post deleted successfully.",
        });
    } catch (error) {
        console.error("DELETE POST ERROR:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to delete post.",
        });
    }
};

exports.likePost = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID.",
            });
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found.",
            });
        }

        const userId = req.user._id.toString();
        const postOwnerId = post.author.toString();

        const alreadyLiked = post.likes.some(
            (likeId) => likeId.toString() === userId
        );

        if (alreadyLiked) {
            post.likes = post.likes.filter(
                (likeId) => likeId.toString() !== userId
            );

            await post.save();

            if (userId !== postOwnerId) {
                try {
                    await Notification.deleteMany({
                        recipient: post.author,
                        sender: req.user._id,
                        type: "like",
                        post: post._id,
                        isRead: false,
                    });
                } catch (notificationError) {
                    console.error(
                        "UNLIKE NOTIFICATION CLEANUP ERROR:",
                        notificationError.message
                    );
                }
            }

            return res.status(200).json({
                success: true,
                message: "Post unliked.",
                liked: false,
                likesCount: post.likes.length,
            });
        }

        post.likes.push(req.user._id);
        await post.save();

        if (userId !== postOwnerId) {
            try {
                const liker = await User.findById(req.user._id).select(
                    "_id name email profilePicture"
                );

                if (liker) {
                    const existingLikeNotification =
                        await Notification.findOne({
                            recipient: post.author,
                            sender: req.user._id,
                            type: "like",
                            post: post._id,
                            isRead: false,
                        });

                    if (!existingLikeNotification) {
                        await Notification.create({
                            recipient: post.author,
                            sender: req.user._id,
                            type: "like",
                            post: post._id,
                            message: `${liker.name} liked your post.`,
                        });
                    }
                }
            } catch (notificationError) {
                console.error(
                    "LIKE NOTIFICATION ERROR:",
                    notificationError.message
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: "Post liked.",
            liked: true,
            likesCount: post.likes.length,
        });
    } catch (error) {
        console.error("LIKE POST ERROR:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to like post.",
        });
    }
};