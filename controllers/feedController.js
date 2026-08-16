const Follow = require("../models/Follow");
const Post = require("../models/Post");

/* ==========================================
   Home Feed
   GET /api/feed
   Protected
========================================== */
exports.getFeed = async (req, res) => {
  try {
    const userId = req.user._id;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // Users the current user follows
    const following = await Follow.find({
      follower: userId,
    }).select("following");

    const followingIds = following.map((f) => f.following);

    // Include current user's posts
    followingIds.push(userId);

    // Fetch feed
    const posts = await Post.find({
      author: { $in: followingIds },
    })
      .populate("author", "name profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({
      author: { $in: followingIds },
    });

    return res.status(200).json({
      success: true,
      page,
      limit,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      posts,
    });

  } catch (error) {
    console.error("FEED ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};