import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { getCurrentUser, login as authLogin, logout as authLogout } from '../services/auth';
import { toast } from 'react-toastify';
import axios from 'axios';

const AuthContext = createContext(null);
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 Minuten

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginInProgress, setIsLoginInProgress] = useState(false);

  // Session-Validierung
  const validateSession = async () => {
    if (isLoginInProgress) return true;

    const currentUser = getCurrentUser();
    if (!currentUser) {
      if (user) {
        setUser(null);
      }
      return false;
    }

    return true;
  };

  // Regelmäßige Session-Überprüfung
  useEffect(() => {
    let interval;
    if (user && !isLoginInProgress) {
      interval = setInterval(async () => {
        const isValid = await validateSession();
        if (!isValid) {
          toast.warn('Ihre Sitzung ist abgelaufen. Bitte loggen Sie sich erneut ein.');
        }
      }, SESSION_CHECK_INTERVAL);
    }
    return () => interval && clearInterval(interval);
  }, [user, isLoginInProgress]);

  // Initiale Benutzerladung
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          const isValid = await validateSession();
          if (isValid) {
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Axios Interceptor für 401 Fehler
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401 && !isLoginInProgress) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [isLoginInProgress]);

  const login = async (credentials) => {
    setIsLoginInProgress(true);
    try {
      const userData = await authLogin(credentials);
      setUser(userData.user);
      toast.success('Erfolgreich eingeloggt!');
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      toast.error('Login fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.');
      throw error;
    } finally {
      setIsLoginInProgress(false);
    }
  };

  const logout = () => {
    authLogout();
    setUser(null);
    toast.info('Sie wurden erfolgreich abgemeldet.');
  };

  const authContextValue = useMemo(() => ({
    user,
    setUser,
    isAuthenticated: !!user,
    isAdminUser: user?.role === 'admin',
    isLoading,
    login,
    logout,
    validateSession,
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);