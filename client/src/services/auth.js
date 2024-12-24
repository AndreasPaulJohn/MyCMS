import axios from 'axios';
import config from '../config';

const API_URL = `${config.API_BASE_URL}/users`;
const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

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

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.token) {
      // Speichere in localStorage UND sessionStorage
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      sessionStorage.setItem(TOKEN_KEY, response.data.token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      
      // Setze globalen Authorization Header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = () => {
  try {
    const token = getAuthToken();
    if (token) {
      axios.post(`${API_URL}/logout`, null, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(error => console.error('Logout error:', error));
    }
  } finally {
    // Cleanup
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const getCurrentUser = () => {
  try {
    // Prüfe zuerst sessionStorage, dann localStorage
    const userString = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    
    if (!userString || !token) return null;
    
    const user = JSON.parse(userString);
    return { ...user, token };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getAuthToken = () => {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
};

export const isUserAuthenticated = async () => {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await axios.get(`${API_URL}/verify-token`);
    return response.data.isValid;
  } catch (error) {
    if (error.response?.status === 401) {
      logout();
    }
    return false;
  }
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isUserAuthenticated,
  getAuthToken,
  isAdmin,
};

export default authService;