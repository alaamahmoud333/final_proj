import User from "../models/user.js";
import Post from "../models/post.js";
import Notification from "../models/notification.js";

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

// FOLLOW USER
export const followUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Check if already following
    if (targetUser.followers.includes(req.user.id)) {
      return res.status(400).json({ message: "Already following" });
    }

    // Check if already requested
    if (targetUser.followRequests && targetUser.followRequests.includes(req.user.id)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    if (targetUser.isPrivate) {
      // Logic for private account: Send Follow Request
      if (!targetUser.followRequests) targetUser.followRequests = [];
      targetUser.followRequests.push(req.user.id);
      await targetUser.save();

      // Create Notification
      const newNotification = new Notification({
        receiver: targetUser._id,
        sender: req.user.id,
        type: 'follow_request',
      });
      await newNotification.save();

      return res.json({ message: "Follow request sent", status: "Requested" });
    } else {
      // Logic for public account: Follow directly
      targetUser.followers.push(req.user.id);
      currentUser.following.push(targetUser._id);
      await targetUser.save();
      await currentUser.save();

      // Create Notification
      const newNotification = new Notification({
        receiver: targetUser._id,
        sender: req.user.id,
        type: 'follow',
      });
      await newNotification.save();

      return res.json({ message: "Successfully followed user", status: "Following" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// ACCEPT FOLLOW REQUEST
export const acceptFollowRequest = async (req, res) => {
  try {
    const senderId = req.params.id; // ID of the user who sent the request
    const currentUser = await User.findById(req.user.id);
    const senderUser = await User.findById(senderId);

    if (!senderUser) {
      return res.status(404).json({ message: "Sender not found" });
    }

    // Check if request exists
    if (!currentUser.followRequests.includes(senderId)) {
      return res.status(400).json({ message: "No follow request from this user" });
    }

    // Remove from followRequests
    currentUser.followRequests = currentUser.followRequests.filter(id => id.toString() !== senderId);
    
    // Add to followers/following
    if (!currentUser.followers.includes(senderId)) {
      currentUser.followers.push(senderId);
    }
    if (!senderUser.following.includes(currentUser._id)) {
      senderUser.following.push(currentUser._id);
    }

    await currentUser.save();
    await senderUser.save();

    // Create Notification to let sender know their request was accepted
    const newNotification = new Notification({
      receiver: senderUser._id,
      sender: currentUser._id,
      type: 'follow',
    });
    await newNotification.save();

    res.json({ message: "Follow request accepted" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// REJECT FOLLOW REQUEST
export const rejectFollowRequest = async (req, res) => {
  try {
    const senderId = req.params.id; // ID of the user who sent the request
    const currentUser = await User.findById(req.user.id);

    // Remove from followRequests
    currentUser.followRequests = currentUser.followRequests.filter(id => id.toString() !== senderId);
    await currentUser.save();

    res.json({ message: "Follow request rejected" });
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