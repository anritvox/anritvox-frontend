import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncCartOnAuth = async () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const guestItems = JSON.parse(savedCart);
        if (Array.isArray(guestItems) && guestItems.length > 0) {
          await Promise.allSettled(
            guestItems.map(async (item) => {
              const pId = item.id || item.product_id || item._id;
              if (pId) {
                // Refactored: Inline API call to prevent Rollup TDZ
                await api.post(`/cart`, { productId: pId, quantity: item.quantity || 1 });
              }
            })
          );
          localStorage.removeItem("cart");
        }
      } catch (err) {
        console.error("Cart sync error:", err);
      }
    }
    window.dispatchEvent(new Event("cart-synced"));
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    window.dispatchEvent(new Event("cart-synced"));
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (storedToken) {
        setToken(storedToken);
        try {
          // Refactored: Inline API call to prevent Rollup TDZ
          const res = await api.get(`/users/profile`);
          const userData = res.data?.user || res.data;
          
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [logout]);

  const login = useCallback(async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    const data = res.data || res;
    const newToken = data.token;
    const newUser = data.user || data;

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    await syncCartOnAuth();
    return newUser;
  }, []);

  const register = useCallback(async (userData) => {
    const res = await api.post("/auth/register", userData);
    const data = res.data || res;
    const newToken = data.token;
    const newUser = data.user || data;

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    await syncCartOnAuth();
    return newUser;
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
