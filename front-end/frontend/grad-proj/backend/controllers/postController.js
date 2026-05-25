import Post from '../models/post.js';
import Notification from '../models/notification.js';

// CREATE POST
export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    const post = new Post({
      user: req.user.id,
      content: content.trim(),
      image: image || null,
    });

    const savedPost = await post.save();
    const populatedPost = await savedPost.populate('user', 'username avatar');

    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: 'Could not create post', error: err.message });
  }
};

// GET ALL POSTS
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch posts', error: err.message });
  }
};

// LIKE / UNLIKE POST
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const hasLiked = post.likes.some((id) => id.toString() === req.user.id);

    if (!hasLiked) {
      post.likes.push(req.user.id);
      if (post.user.toString() !== req.user.id) {
        await Notification.create({
          receiver: post.user,
          sender: req.user.id,
          type: 'like',
          post: post._id,
        });
      }
    } else {
      post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
    }

    await post.save();
    const populatedPost = await post.populate('user', 'username avatar');
    await populatedPost.populate('comments.user', 'username avatar');

    res.json({
      message: hasLiked ? 'Post unliked' : 'Post liked',
      likes: post.likes.length,
      post: populatedPost,
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not like post', error: err.message });
  }
};

// ADD COMMENT
export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    post.comments.push({
      user: req.user.id,
      text: text.trim(),
    });

    await post.save();
    await post.populate('comments.user', 'username avatar');

    if (post.user.toString() !== req.user.id) {
      await Notification.create({
        receiver: post.user,
        sender: req.user.id,
        type: 'comment',
        post: post._id,
      });
    }

    res.status(201).json({
      message: 'Comment added',
      comments: post.comments,
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not add comment', error: err.message });
  }
};