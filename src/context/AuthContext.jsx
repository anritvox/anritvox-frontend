// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { addToCartAPI } from '../services/api'; // 🔴 Step 1: Import the cart API

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

  // 🔴 Step 2: Helper function to sync guest cart to the database
  const syncCartOnAuth = async (authToken) => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const guestItems = JSON.parse(savedCart);
        if (Array.isArray(guestItems) && guestItems.length > 0) {
          // Push each guest item to the backend
          for (const item of guestItems) {
            const pId = item.id || item.product_id;
            if (pId) {
              await addToCartAPI(authToken, pId, item.quantity || 1);
            }
          }
          // Wipe local storage so it doesn't duplicate on next login
          localStorage.removeItem('cart');
          
          // Dispatch a custom event to tell CartContext to refresh
          window.dispatchEvent(new Event('cart-synced'));
        }
      } catch (err) {
        console.error("Failed to sync guest cart:", err);
      }
    }
  };

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

    // 🔴 Step 3: Trigger cart sync immediately after successful registration
    await syncCartOnAuth(body.token);

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

    // 🔴 Step 3: Trigger cart sync immediately after successful login
    await syncCartOnAuth(body.token);

    return body.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    
    // Tell cart context to clear out user data and revert to guest
    window.dispatchEvent(new Event('cart-synced'));
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
