import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, users } from '../services/api';

const AuthContext = createContext(null);

// Helper function to read the token's real payload
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
          // Check what the token ACTUALLY says your role is
          const decodedPayload = decodeJWT(token);
          
          const res = await users.getProfile();
          const fetchedUser = res.data.user || res.data;
          
          // Force merge the role from the token so the backend doesn't accidentally demote you
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
    
    // Safety check on login
    const decodedPayload = decodeJWT(newToken);
    const finalUser = { ...userData, role: decodedPayload?.role || userData?.role || 'user' };

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(finalUser);
    return res.data;
  };

  const adminLogin = async (credentials) => {
    const res = await auth.adminLogin(credentials);
    const { token: newToken, admin: adminData, user: userData } = res.data;
    
    // Hardcode the admin presence
    const finalUser = { ...(adminData || userData), role: 'admin' };
    
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(finalUser);
    return res.data;
  };

  const register = async (data) => {
    const res = await auth.register(data);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return res.data;
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
