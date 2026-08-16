const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");

const {
    uploadToCloudinary,
    deleteFromCloudinary,
} = require("../utils/cloudinaryUpload");

// ==========================================
// Helper: Validate MongoDB ObjectId
// ==========================================
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// ==========================================
// Helper: Check Post Ownership
// ==========================================
const isPostOwner = (post, userId) => {
    return (
        post.author.toString() ===
        userId.toString()
    );
};

// ==========================================
// Helper: Sync User Post Count
// ==========================================
const syncUserPostCount = async (
    userId
) => {
    const postsCount =
        await Post.countDocuments({
            author: userId,
        });

    await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                postsCount,
            },
        }
    );

    return postsCount;
};

// ==========================================
// Create Post
// ==========================================
exports.createPost = async (req, res) => {
    let uploadedPublicId = "";
    let createdPostId = null;

    try {
        console.log(
            "===================================="
        );
        console.log("CREATE POST");
        console.log(
            "User ID:",
            req.user?._id
        );
        console.log(
            "Body:",
            req.body
        );
        console.log(
            "File:",
            req.file
                ? {
                      fieldname:
                          req.file.fieldname,
                      originalname:
                          req.file.originalname,
                      mimetype:
                          req.file.mimetype,
                      size:
                          req.file.size,
                  }
                : "No file"
        );
        console.log(
            "===================================="
        );

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

        const caption =
            typeof req.body.caption ===
            "string"
                ? req.body.caption.trim()
                : "";

        // ------------------------------------------
        // Require caption OR image
        // ------------------------------------------
        if (
            !caption &&
            !req.file
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Post must contain a caption or an image.",
            });
        }

        let imageUrl = "";
        let imagePublicId = "";

        // ------------------------------------------
        // Upload image to Cloudinary
        // ------------------------------------------
        if (req.file) {
            console.log(
                "Uploading post image to Cloudinary..."
            );

            const result =
                await uploadToCloudinary(
                    req.file.buffer,
                    {
                        folder:
                            "mini-social-media/posts",
                        resource_type:
                            "image",
                    }
                );

            if (
                !result ||
                !result.secure_url ||
                !result.public_id
            ) {
                throw new Error(
                    "Cloudinary image upload failed."
                );
            }

            imageUrl =
                result.secure_url;

            imagePublicId =
                result.public_id;

            uploadedPublicId =
                result.public_id;

            console.log(
                "Cloudinary upload successful."
            );
            console.log(
                "Image URL:",
                imageUrl
            );
            console.log(
                "Public ID:",
                imagePublicId
            );
        }

        // ------------------------------------------
        // Create MongoDB Post
        // ------------------------------------------
        const post =
            await Post.create({
                author: req.user._id,
                caption,
                image: imageUrl,
                imagePublicId,
            });

        createdPostId =
            post._id;

        // ------------------------------------------
        // Sync User Post Count
        // ------------------------------------------
        const postsCount =
            await syncUserPostCount(
                req.user._id
            );

        console.log(
            "User postsCount synchronized:",
            postsCount
        );

        // ------------------------------------------
        // Populate author
        // ------------------------------------------
        await post.populate(
            "author",
            "name email profilePicture"
        );

        console.log(
            "Post created:",
            post._id
        );

        return res.status(201).json({
            success: true,
            message:
                "Post created successfully.",
            post,
        });
    } catch (error) {
        console.error(
            "===================================="
        );
        console.error(
            "CREATE POST ERROR"
        );
        console.error(
            "Name:",
            error.name
        );
        console.error(
            "Message:",
            error.message
        );
        console.error(
            "Code:",
            error.code
        );
        console.error(
            "===================================="
        );

        // ------------------------------------------
        // Cleanup MongoDB post if count sync failed
        // after post creation
        // ------------------------------------------
        if (createdPostId) {
            try {
                await Post.findByIdAndDelete(
                    createdPostId
                );

                console.log(
                    "MongoDB post cleanup successful:",
                    createdPostId.toString()
                );
            } catch (cleanupPostError) {
                console.error(
                    "MONGODB POST CLEANUP ERROR:",
                    cleanupPostError.message
                );
            }
        }

        // ------------------------------------------
        // Cleanup Cloudinary image
        // ------------------------------------------
        if (uploadedPublicId) {
            try {
                await deleteFromCloudinary(
                    uploadedPublicId
                );

                console.log(
                    "Cloudinary cleanup successful:",
                    uploadedPublicId
                );
            } catch (
                cleanupError
            ) {
                console.error(
                    "CLOUDINARY CLEANUP ERROR:",
                    cleanupError.message
                );
            }
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to create post.",
        });
    }
};

// ==========================================
// Get All Posts
// ==========================================
exports.getAllPosts = async (
    req,
    res
) => {
    try {
        const posts =
            await Post.find()
                .populate(
                    "author",
                    "name email profilePicture"
                )
                .sort({
                    createdAt: -1,
                });

        return res.status(200).json({
            success: true,
            count: posts.length,
            posts,
        });
    } catch (error) {
        console.error(
            "GET POSTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to get posts.",
        });
    }
};

// ==========================================
// Get Single Post
// ==========================================
exports.getPostById = async (
    req,
    res
) => {
    try {
        const { id } =
            req.params;

        // ------------------------------------------
        // Validate ID
        // ------------------------------------------
        if (
            !isValidObjectId(id)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid post ID.",
            });
        }

        const post =
            await Post.findById(
                id
            ).populate(
                "author",
                "name email profilePicture"
            );

        if (!post) {
            return res.status(404).json({
                success: false,
                message:
                    "Post not found.",
            });
        }

        return res.status(200).json({
            success: true,
            post,
        });
    } catch (error) {
        console.error(
            "GET POST ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to get post.",
        });
    }
};

// ==========================================
// Update Post
// ==========================================
exports.updatePost = async (
    req,
    res
) => {
    let newUploadedPublicId =
        "";

    try {
        const { id } =
            req.params;

        const caption =
            typeof req.body.caption ===
            "string"
                ? req.body.caption.trim()
                : undefined;

        // ------------------------------------------
        // Validate ID
        // ------------------------------------------
        if (
            !isValidObjectId(id)
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
            await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message:
                    "Post not found.",
            });
        }

        // ------------------------------------------
        // Check Ownership
        // ------------------------------------------
        if (
            !isPostOwner(
                post,
                req.user._id
            )
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to update this post.",
            });
        }

        // ------------------------------------------
        // Require something to update
        // ------------------------------------------
        if (
            caption ===
                undefined &&
            !req.file
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Provide a caption or image to update.",
            });
        }

        // ------------------------------------------
        // Save old image information
        // ------------------------------------------
        const oldImageUrl =
            post.image;

        const oldImagePublicId =
            post.imagePublicId;

        let newImageUrl =
            oldImageUrl;

        let newImagePublicId =
            oldImagePublicId;

        // ------------------------------------------
        // Upload Replacement Image
        // ------------------------------------------
        if (req.file) {
            console.log(
                "Uploading replacement image..."
            );

            const result =
                await uploadToCloudinary(
                    req.file.buffer,
                    {
                        folder:
                            "mini-social-media/posts",
                        resource_type:
                            "image",
                    }
                );

            if (
                !result ||
                !result.secure_url ||
                !result.public_id
            ) {
                throw new Error(
                    "Cloudinary image upload failed."
                );
            }

            newImageUrl =
                result.secure_url;

            newImagePublicId =
                result.public_id;

            newUploadedPublicId =
                result.public_id;

            console.log(
                "New Cloudinary image uploaded successfully."
            );
            console.log(
                "New Image URL:",
                newImageUrl
            );
            console.log(
                "New Public ID:",
                newImagePublicId
            );
        }

        // ------------------------------------------
        // Update Caption
        // ------------------------------------------
        if (
            caption !==
            undefined
        ) {
            post.caption =
                caption;
        }

        // ------------------------------------------
        // Update Image
        // ------------------------------------------
        if (req.file) {
            post.image =
                newImageUrl;

            post.imagePublicId =
                newImagePublicId;
        }

        // ------------------------------------------
        // Mark Edited
        // ------------------------------------------
        post.isEdited = true;

        // ------------------------------------------
        // IMPORTANT:
        // Save MongoDB BEFORE deleting old image.
        // ------------------------------------------
        await post.save();

        // MongoDB now references
        // the new image safely.
        newUploadedPublicId = "";

        // ------------------------------------------
        // Delete Old Cloudinary Image
        // ------------------------------------------
        if (
            req.file &&
            oldImagePublicId &&
            oldImagePublicId !==
                newImagePublicId
        ) {
            try {
                await deleteFromCloudinary(
                    oldImagePublicId
                );

                console.log(
                    "Old Cloudinary image deleted successfully:",
                    oldImagePublicId
                );
            } catch (
                deleteError
            ) {
                // MongoDB is already correct.
                // Do not roll back the post update.
                console.error(
                    "OLD IMAGE DELETE ERROR:",
                    deleteError.message
                );
            }
        }

        // ------------------------------------------
        // Populate Author
        // ------------------------------------------
        await post.populate(
            "author",
            "name email profilePicture"
        );

        return res.status(200).json({
            success: true,
            message:
                "Post updated successfully.",
            post,
        });
    } catch (error) {
        console.error(
            "===================================="
        );
        console.error(
            "UPDATE POST ERROR"
        );
        console.error(
            "Name:",
            error.name
        );
        console.error(
            "Message:",
            error.message
        );
        console.error(
            "===================================="
        );

        // ------------------------------------------
        // Cleanup newly uploaded image
        // ------------------------------------------
        if (
            newUploadedPublicId
        ) {
            try {
                await deleteFromCloudinary(
                    newUploadedPublicId
                );

                console.log(
                    "New image cleanup successful:",
                    newUploadedPublicId
                );
            } catch (
                cleanupError
            ) {
                console.error(
                    "NEW IMAGE CLEANUP ERROR:",
                    cleanupError.message
                );
            }
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to update post.",
        });
    }
};

// ======================================================
// Delete Post
// DELETE /api/posts/:id
// Protected
// ======================================================

exports.deletePost = async (
    req,
    res
) => {
    try {
        const { id } =
            req.params;

        // --------------------------------------------------
        // Validate ID
        // --------------------------------------------------
        if (
            !isValidObjectId(id)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid post ID.",
            });
        }

        // --------------------------------------------------
        // Find post
        // --------------------------------------------------
        const post =
            await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message:
                    "Post not found.",
            });
        }

        // --------------------------------------------------
        // Check ownership
        // --------------------------------------------------
        if (
            !isPostOwner(
                post,
                req.user._id
            )
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to delete this post.",
            });
        }

        // Save author before deleting
        // the post document.
        const authorId =
            post.author;

        // --------------------------------------------------
        // Delete Cloudinary image first
        // --------------------------------------------------
        if (
            post.imagePublicId
        ) {
            try {
                console.log(
                    "Deleting Cloudinary image:",
                    post.imagePublicId
                );

                await deleteFromCloudinary(
                    post.imagePublicId
                );

                console.log(
                    "Cloudinary image deleted successfully:",
                    post.imagePublicId
                );
            } catch (
                cloudinaryError
            ) {
                console.error(
                    "CLOUDINARY DELETE ERROR:",
                    cloudinaryError
                );

                // Do not delete MongoDB post
                // when image cleanup fails.
                return res.status(500).json({
                    success: false,
                    message:
                        "Post was not deleted because the associated image could not be removed.",
                    error:
                        cloudinaryError.message,
                });
            }
        }

        // --------------------------------------------------
        // Delete MongoDB post
        // --------------------------------------------------
        await post.deleteOne();

        console.log(
            "MongoDB post deleted:",
            id
        );

        // --------------------------------------------------
        // Sync User Post Count
        // --------------------------------------------------
        const postsCount =
            await syncUserPostCount(
                authorId
            );

        console.log(
            "User postsCount synchronized:",
            postsCount
        );

        return res.status(200).json({
            success: true,
            message:
                "Post deleted successfully.",
        });
    } catch (error) {
        console.error(
            "DELETE POST ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to delete post.",
        });
    }
};

// ==========================================
// Like / Unlike Post
// PUT /api/posts/:id/like
// Protected
// ==========================================
exports.likePost = async (
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

        const { id } =
            req.params;

        // ------------------------------------------
        // Validate ID
        // ------------------------------------------
        if (!isValidObjectId(id)) {
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
            await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message:
                    "Post not found.",
            });
        }

        const userId =
            req.user._id.toString();

        const postOwnerId =
            post.author.toString();

        // ------------------------------------------
        // Check Existing Like
        // ------------------------------------------
        const alreadyLiked =
            post.likes.some(
                (likeId) =>
                    likeId.toString() ===
                    userId
            );

        // ------------------------------------------
        // Unlike
        // ------------------------------------------
        if (alreadyLiked) {
            post.likes =
                post.likes.filter(
                    (likeId) =>
                        likeId.toString() !==
                        userId
                );

            await post.save();

            // Remove the unread like notification generated by
            // this user for this post. This keeps repeated
            // like/unlike testing from leaving stale duplicates.
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
                    // Notification cleanup must not make an
                    // otherwise successful unlike fail.
                    console.error(
                        "UNLIKE NOTIFICATION CLEANUP ERROR:",
                        notificationError
                    );
                }
            }

            return res.status(200).json({
                success: true,
                message:
                    "Post unliked.",
                liked: false,
                likesCount:
                    post.likes.length,
            });
        }

        // ------------------------------------------
        // Like
        // ------------------------------------------
        post.likes.push(
            req.user._id
        );

        await post.save();

        // ------------------------------------------
        // Create Like Notification
        // ------------------------------------------
        // Do not notify when a user likes their
        // own post.
        // ------------------------------------------
        if (
            userId !==
            postOwnerId
        ) {
            try {
                const liker =
                    await User.findById(
                        req.user._id
                    ).select(
                        "_id name email profilePicture"
                    );

                if (liker) {
                    // Prevent duplicate unread like notifications
                    // from repeated requests for the same user/post.
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
                            recipient:
                                post.author,
                            sender:
                                req.user._id,
                            type:
                                "like",
                            post:
                                post._id,
                            message:
                                `${liker.name} liked your post.`,
                        });
                    }
                }
            } catch (
                notificationError
            ) {
                // Notification failure must not
                // make a successful like fail.
                console.error(
                    "LIKE NOTIFICATION ERROR:",
                    notificationError
                );
            }
        }

        // ------------------------------------------
        // Response
        // ------------------------------------------
        return res.status(200).json({
            success: true,
            message:
                "Post liked.",
            liked: true,
            likesCount:
                post.likes.length,
        });
    } catch (error) {
        console.error(
            "LIKE POST ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to like post.",
        });
    }
};