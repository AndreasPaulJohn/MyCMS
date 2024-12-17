// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { getCurrentUser, login as authLogin, logout as authLogout } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = getCurrentUser();
        if (currentUser) setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (credentials) => {
    try {
      const userData = await authLogin(credentials);
      setUser(userData.user);
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const authContextValue = useMemo(() => {
    const isAuthenticated = !!user;
    const isAdminUser = user?.role === 'admin';

    return {
      user,
      setUser,
      isAuthenticated,
      isAdminUser,
      isLoading,
      login,
      logout,
    };
  }, [user, isLoading]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);