import axios from "axios";
import { getAuthToken, refreshToken } from "./auth";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Keep this as 5000
});

export const getPosts = async (page = 1, limit = 12) => {
  try {
    const response = await api.get('/posts', {
      params: { page, limit }
    });
    console.log('API response:', response.data); // Debugging
    return response.data;
  } catch (error) {
    console.error('Error in getPosts:', error);
    throw error;
  }
};

export const getPostById = (id) => api.get(`/posts/${id}`);

export const getComments = async (postId) => {
  try {
    const response = await api.get(`/comments/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

export const createComment = async (postId, content) => {
  try {
    const response = await api.post("/comments", { post_id: postId, content });
    return response.data;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

api.interceptors.request.use(
  async (config) => {
    let token = getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshToken();
      if (newToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export const getUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const sendContactForm = async (formData) => {
  try {
    const response = await api.post("/contact", formData);
    return response.data;
  } catch (error) {
    console.error("Error sending contact form:", error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    await api.delete(`/users/${userId}`);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const createPost = async (formData) => {
  try {
    console.log('Sending createPost request');
    const response = await axios.post('/api/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('createPost response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in createPost:', error);
    throw error;
  }
};

export const updatePost = async (id, postData) => {
  try {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};

export const deletePost = async (id) => {
  try {
    await api.delete(`/posts/${id}`);
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

export const searchPosts = async (
  query,
  category = "",
  dateFrom = "",
  dateTo = ""
) => {
  try {
    const response = await api.get("/posts/search", {
      params: { query, category, dateFrom, dateTo },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching posts:", error);
    throw error;
  }
};

export const moderateComment = async (commentId, status) => {
  try {
    const response = await api.patch(`/comments/${commentId}/moderate`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error moderating comment:", error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await api.post("/categories", categoryData);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

export const deletePostImage = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}/image`);
    return response.data;
  } catch (error) {
    console.error('Error deleting post image:', error);
    throw error;
  }
};

const apiService = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
  getComments,
  moderateComment,
  createComment,
  createCategory,
  getCategories,
  deleteCategory,
  getUsers,
  deleteUser,
  sendContactForm,
};

export default apiService;
