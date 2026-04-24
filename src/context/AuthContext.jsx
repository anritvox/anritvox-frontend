import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, users } from '../services/api';

const AuthContext = createContext(null);

// Helper function to safely read the token's real payload
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
      if (token) {
        try {
          const decodedPayload = decodeJWT(token);
          const res = await users.getProfile();
          const fetchedUser = res.data.user || res.data;
          
          setUser({ 
            ...fetchedUser, 
            role: decodedPayload?.role || fetchedUser.role || 'user' 
          });
        } catch (err) {
          console.error("Session verification failed", err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (credentials) => {
    const res = await auth.login(credentials);
    const { token: newToken, user: userData } = res.data;
    
    const decodedPayload = decodeJWT(newToken);
    const finalUser = { ...userData, role: decodedPayload?.role || userData?.role || 'user' };

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(finalUser);
    
    return finalUser; // CRITICAL FIX: Return the user object, not the full response
  };

  const adminLogin = async (credentials) => {
    const res = await auth.adminLogin(credentials);
    const { token: newToken, admin: adminData, user: userData } = res.data;
    
    const finalUser = { ...(adminData || userData), role: 'admin' };
    
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(finalUser);
    
    return finalUser; // CRITICAL FIX: Return the user object so AdminLogin can read finalUser.role
  };

  const register = async (data) => {
    const res = await auth.register(data);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('ms_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, adminLogin, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
