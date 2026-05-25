import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const postsAPI = {
  getAll: () => api.get('/posts'),
  create: (data) => api.post('/posts', data),
  like: (id) => api.put(`/posts/${id}/like`),
  addComment: (id, text) => api.post(`/posts/${id}/comment`, { text }),
};

export const usersAPI = {
  getById: (id) => api.get(`/users/${id}`),
  getProfile: (id) => api.get(`/users/profile/${id}`),
  search: (q) => api.get(`/users/search?q=${encodeURIComponent(q)}`),
  updateProfile: (id, data) => api.put(`/users/profile/${id}`, data),
  getUserPosts: (id) => api.get(`/users/${id}/posts`),
  follow: (id) => api.put(`/users/${id}/follow`),
};

export const notificationsAPI = {
  getUnread: () => api.get('/notifications/unread'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

export default api;
