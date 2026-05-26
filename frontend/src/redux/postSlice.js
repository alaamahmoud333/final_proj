import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postsAPI } from '../services/api';

export const fetchPosts = createAsyncThunk('posts/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await postsAPI.getAll();
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch posts');
  }
});

export const createPost = createAsyncThunk('posts/create', async (postData, { rejectWithValue }) => {
  try {
    const response = await postsAPI.create(postData);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create post');
  }
});

export const likePost = createAsyncThunk('posts/like', async ({ postId, userId }, { rejectWithValue }) => {
  try {
    const response = await postsAPI.like(postId);
    return response.data.post;
  } catch (err) {
    return rejectWithValue({ postId, userId, error: err.response?.data?.message || 'Failed to like post' });
  }
});

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, text, user, tempId }, { rejectWithValue }) => {
    try {
      const response = await postsAPI.addComment(postId, text);
      return { postId, comments: response.data.comments, tempId };
    } catch (err) {
      return rejectWithValue({ postId, tempId, error: err.response?.data?.message || 'Failed to add comment' });
    }
  }
);

const postSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    loading: false,
    creating: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPost.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.creating = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      
      // OPTIMISTIC LIKE
      .addCase(likePost.pending, (state, action) => {
        const { postId, userId } = action.meta.arg;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          const hasLiked = post.likes.some((id) => id === userId || id?._id === userId);
          if (hasLiked) {
            post.likes = post.likes.filter((id) => id !== userId && id?._id !== userId);
          } else {
            post.likes.push(userId);
          }
        }
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.posts.findIndex((p) => p._id === updated._id);
        if (index !== -1) state.posts[index] = updated;
      })
      .addCase(likePost.rejected, (state, action) => {
        // Revert on failure
        const { postId, userId } = action.payload || action.meta.arg;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          const hasLiked = post.likes.some((id) => id === userId || id?._id === userId);
          if (hasLiked) post.likes = post.likes.filter((id) => id !== userId && id?._id !== userId);
          else post.likes.push(userId);
        }
      })

      // OPTIMISTIC COMMENT
      .addCase(addComment.pending, (state, action) => {
        const { postId, text, user, tempId } = action.meta.arg;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.comments.push({ _id: tempId, user, text, createdAt: new Date().toISOString() });
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.comments = comments; // Replace with actual server comments
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        const { postId, tempId } = action.payload || action.meta.arg;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.comments = post.comments.filter(c => c._id !== tempId); // Revert
        }
      });
  },
});

export const { clearError } = postSlice.actions;
export default postSlice.reducer;
