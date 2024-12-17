import axios from 'axios';
import config from '../config';

const API_URL = `${config.API_BASE_URL}/users`;

// ... andere imports bleiben gleich ...

export const register = async (username, email, password, captchaId, captchaAnswer) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      username,
      email,
      password,
      captchaId,
      captchaAnswer
    });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
};

// ... Rest der Datei bleibt unverändert ...

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const checkUserActivation = async (userId) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/check-activation/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.isActivated;
  } catch (error) {
    console.error('Error checking user activation:', error);
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Optional: Informieren Sie den Server über den Logout
  axios.post(`${API_URL}/logout`).catch(error => console.error('Logout error:', error));
};

const redirectToLogin = () => {
  window.location.href = '/login'; // Redirect to login page
};

export const getCurrentUser = () => {
  const userString = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  if (userString && token) {
    return { ...JSON.parse(userString), token };
  }
  return null;
};

export const isUserAuthenticated = async () => {
  const user = getCurrentUser();
  if (!user || !user.token) return false;

  try {
    const response = await axios.get(`${API_URL}/verify-token`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    return response.data.isValid;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

const handleInvalidToken = () => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    logout();
    redirectToLogin();
  }
};

export const canUserEditPost = (post) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  return currentUser.role === 'admin' || post.author_id === currentUser.id;
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const refreshToken = async () => {
  const token = getAuthToken();
  if (!token) {
    handleInvalidToken();
    return null;
  }

  try {
    const response = await axios.post(`${API_URL}/refresh-token`, { token });
    const newToken = response.data.token;
    if (newToken) {
      localStorage.setItem('token', newToken);
      return newToken;
    } else {
      throw new Error('No new token received');
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    handleInvalidToken();
    return null;
  }
};

export const startTokenCheckInterval = () => {
  setInterval(async () => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.token) {
      const isValid = await isUserAuthenticated();
      if (!isValid) {
        handleInvalidToken();
      }
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
};

export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newToken = await refreshToken();
          if (newToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          handleInvalidToken();
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};

export const getUserRole = async () => {
  const user = getCurrentUser();
  if (!user || !user.token) return null;

  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    return response.data.role;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

// Ensure interceptors are set up when the service is loaded
setupAxiosInterceptors();

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isUserAuthenticated,
  canUserEditPost,
  getAuthToken,
  refreshToken,
  getUserRole,
  isAdmin,
  startTokenCheckInterval,
};

export default authService;