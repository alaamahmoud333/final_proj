import User from "../models/user.js";
import Post from "../models/post.js";

// GET USER PROFILE
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

// SEARCH USERS BY USERNAME OR NAME
export const searchUsers = async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    if (!query) {
      return res.json([]);
    }

    const regex = new RegExp(query, 'i');
    const users = await User.find({
      $or: [
        { username: regex },
        { name: regex },
      ],
    }).select('username name avatar bio');

    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET USER PROFILE (PROFILE PAGE)
export const getProfile = async (req, res) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    let user;
    if (isObjectId) {
      user = await User.findById(req.params.id).select("-password");
    } else {
      user = await User.findOne({ username: req.params.id }).select("-password");
    }
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

// UPDATE USER PROFILE
export const updateProfile = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "You can only edit your own profile" });
    }

    const { bio, avatar } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET POSTS CREATED BY A SPECIFIC USER
export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id })
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch user posts', error: err.message });
  }
};

// FOLLOW REQUEST USER
export const followUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    // Check if already following
    if (user.followers.includes(req.user.id)) {
      return res.status(400).json("Already following");
    }

    // Check if already requested
    if (user.followRequests && user.followRequests.includes(req.user.id)) {
      return res.status(400).json("Request already sent");
    }

    if (!user.followRequests) user.followRequests = [];
    user.followRequests.push(req.user.id);
    await user.save();

    res.json("Follow request sent");
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET FRIEND SUGGESTIONS
export const getSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const followingIds = currentUser.following;
    followingIds.push(currentUser._id); // Exclude self

    const suggestions = await User.aggregate([
      { $match: { _id: { $nin: followingIds } } },
      { $sample: { size: 5 } },
      { $project: { password: 0 } }
    ]);

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch suggestions", error: err.message });
  }
};