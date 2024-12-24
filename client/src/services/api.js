import axios from "axios";
import { getAuthToken, logout } from "./auth";
import config from '../config';

const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// API-Funktionen
export const generateCaptcha = async () => {
  try {
    const response = await axios.get('/api/captcha/generate');
    return response.data;
  } catch (error) {
    console.error('Error generating captcha:', error);
    throw error;
  }
};

export const verifyCaptcha = async (id, answer) => {
  try {
    const response = await axios.post('/api/captcha/verify', { id, answer });
    return response.data.valid;
  } catch (error) {
    console.error('Error verifying captcha:', error);
    throw error;
  }
};

export const getPosts = async (page = 1, limit = 12) => {
  try {
    const response = await api.get('/posts', {
      params: { page, limit }
    });
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

export const createPost = async (postData) => {
  try {
    const response = await api.post('/posts', postData);
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

export const searchPosts = async (query, category, dateFrom, dateTo) => {
  try {
    console.log('Sending search request:', { query, category, dateFrom, dateTo });
    const response = await api.get('/posts/search', {
      params: { query, category, dateFrom, dateTo }
    });
    console.log('Search response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error searching posts:', error);
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

export const getUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
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

export const sendContactForm = async (formData) => {
  try {
    const response = await api.post("/contact", formData);
    return response.data;
  } catch (error) {
    console.error("Error sending contact form:", error);
    throw error;
  }
};



export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  try {
    const response = await api.post('/posts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      maxContentLength: 10000000, // 10MB
      maxBodyLength: 10000000,
    });
    
    // Logging für besseres Debugging
    console.log('Upload response:', response.data);
    
    // Stellen sicher, dass die URL den korrekten Pfad hat
    const imageUrl = response.data.url;
    if (!imageUrl) {
      throw new Error('No URL in upload response');
    }
    
    return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const addImageToPost = async (postId, imageUrl) => {
  try {
    // Normalisiere die imageUrl
    const normalizedUrl = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
    
    const response = await api.post(`/posts/${postId}/images`, { 
      imageUrl: normalizedUrl 
    });
    
    console.log('Add image response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding image to post:', error);
    throw error;
  }
};

export const deletePostImage = async (postId, imageUrl) => {
  try {
    // Normalisiere die imageUrl
    const normalizedUrl = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
    
    const response = await api.delete(`/posts/${postId}/images`, { 
      data: { 
        imageUrl: normalizedUrl 
      } 
    });
    
    console.log('Delete image response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting post image:', error);
    throw error;
  }
};




// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      logout();
    }
    return Promise.reject(error);
  }
);

const apiService = {
  addImageToPost,
  deletePostImage,
  verifyCaptcha,
  generateCaptcha,
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
  uploadImage
};

export default apiService;