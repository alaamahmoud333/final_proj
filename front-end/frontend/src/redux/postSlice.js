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

export const likePost = createAsyncThunk('posts/like', async (postId, { rejectWithValue }) => {
  try {
    const response = await postsAPI.like(postId);
    return response.data.post;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to like post');
  }
});

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, text }, { rejectWithValue }) => {
    try {
      const response = await postsAPI.addComment(postId, text);
      return { postId, comments: response.data.comments };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add comment');
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
      .addCase(likePost.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.posts.findIndex((p) => p._id === updated._id);
        if (index !== -1) state.posts[index] = updated;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (post) post.comments = comments;
      });
  },
});

export const { clearError } = postSlice.actions;
export default postSlice.reducer;
