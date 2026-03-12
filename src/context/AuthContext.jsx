// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
const BASE_URL = import.meta.env.VITE_BASE_URL;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('user_token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {}
    setLoading(false);
  }, []);

  const register = useCallback(async ({ name, email, password, phone }) => {
    const res = await fetch(`${BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || 'Registration failed');
    localStorage.setItem('user_token', body.token);
    localStorage.setItem('user', JSON.stringify(body.user));
    setToken(body.token);
    setUser(body.user);
    return body.user;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res = await fetch(`${BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || 'Login failed');
    localStorage.setItem('user_token', body.token);
    localStorage.setItem('user', JSON.stringify(body.user));
    setToken(body.token);
    setUser(body.user);
    return body.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user');
    // Keep admin token separate
    setToken(null);
    setUser(null);
  }, []);

  const authFetch = useCallback(async (url, options = {}) => {
    const t = token || localStorage.getItem('user_token');
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...(options.body && !(options.body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
      },
    });
    return res;
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
