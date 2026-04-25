import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Synchronized with your api.js interceptor
      const storedToken = localStorage.getItem('token'); 
      if (storedToken) {
        try {
          const res = await authApi.getProfile();
          setUser(res.data?.data || res.data);
        } catch (error) {
          console.error("Session verification failed. Wiping node.");
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();

    const handleAuthExpired = () => setUser(null);
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const login = async (credentials) => {
    try {
      const res = await authApi.login(credentials);
      
      // Handle 2FA Intercept
      if (res.status === 202 || res.data?.requires2FA) {
        throw new Error("MFA Verification Required");
      }

      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      if (error.message === "MFA Verification Required") throw error;
      
      const status = error.response?.status;
      if (status === 429) throw new Error("Security throttle active. Too many attempts. Try again in 60s.");
      if (status === 401) throw new Error("Invalid credentials. Access denied.");
      throw new Error(error.response?.data?.message || "Secure connection failed.");
    }
  };

  const register = async (userData) => {
    try {
      const res = await authApi.register(userData);
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data.user;
      }
      return res.data;
    } catch (error) {
      const status = error.response?.status;
      if (status === 409) throw new Error("A node with this email already exists in the matrix.");
      throw new Error(error.response?.data?.message || "Registration failed.");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('ms_token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
