import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi, users as usersApi } from '../services/api';

const AuthContext = createContext(null);

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const decodedPayload = decodeJWT(storedToken);
          let fetchedUser;

          // STRICT ROUTING: Admins hit authRoutes, Customers hit userRoutes
          if (decodedPayload?.role === 'admin') {
            const res = await authApi.getAdminProfile();
            fetchedUser = res.data;
          } else {
            const res = await usersApi.getProfile();
            fetchedUser = res.data.user || res.data;
          }
          
          setUser({ 
            ...fetchedUser, 
            role: decodedPayload?.role || fetchedUser?.role || 'user' 
          });
          setToken(storedToken);
        } catch (err) {
          console.error("Session verification failed", err);
          logout();
        }
      }
      setLoading(false);
    };
    
    initAuth();

    // Listen for global 401 expulsions from api.js
    const handleAuthExpired = () => logout();
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

      const { token: newToken, user: userData } = res.data;
      const decodedPayload = decodeJWT(newToken);
      const finalUser = { ...userData, role: decodedPayload?.role || userData?.role || 'user' };

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(finalUser));
      setToken(newToken);
      setUser(finalUser);
      
      return finalUser;
    } catch (error) {
      if (error.message === "MFA Verification Required") throw error;
      
      const status = error.response?.status;
      if (status === 429) throw new Error("Security throttle active. Too many attempts. Try again in 60s.");
      if (status === 401) throw new Error("Invalid credentials. Access denied.");
      throw new Error(error.response?.data?.message || "Secure connection failed.");
    }
  };

  // THIS WAS THE MISSING FUNCTION CAUSING YOUR ERROR
  const adminLogin = async (credentials) => {
    try {
      const res = await authApi.adminLogin(credentials);
      const { token: newToken, admin: adminData } = res.data;
      
      const finalUser = { ...adminData, role: 'admin' };
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(finalUser);
      
      return finalUser;
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) throw new Error("Security throttle active. Too many attempts.");
      if (status === 401) throw new Error("Invalid admin credentials. Access denied.");
      throw new Error(error.response?.data?.message || "Secure connection failed.");
    }
  };

  const register = async (data) => {
    try {
      const res = await authApi.register(data);
      if (res.data?.token) {
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
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
    setToken(null);
    setUser(null);
    
    // Auto-redirect if they are on a protected route
    if (window.location.pathname.includes('/profile') || window.location.pathname.includes('/admin')) {
      window.location.href = '/login';
    }
  };

  return (
    // WE EXPORT adminLogin HERE NOW!
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, adminLogin, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
