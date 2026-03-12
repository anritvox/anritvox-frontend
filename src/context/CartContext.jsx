// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
const BASE_URL = import.meta.env.VITE_BASE_URL;
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  const getToken = () => localStorage.getItem('user_token');

  // Load cart: from API if logged in, else from localStorage
  const loadCart = useCallback(async () => {
    const token = getToken();
    if (token) {
      try {
        setCartLoading(true);
        const res = await fetch(`${BASE_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCart(data);
          return;
        }
      } catch {}
      finally { setCartLoading(false); }
    }
    // Guest fallback
    try {
      const saved = localStorage.getItem('cart');
      setCart(saved ? JSON.parse(saved) : []);
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => { loadCart(); }, [loadCart]);

  // Persist guest cart
  useEffect(() => {
    if (!getToken()) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = useCallback(async (product, quantity = 1) => {
    const token = getToken();
    if (token) {
      try {
        const res = await fetch(`${BASE_URL}/api/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId: product.id, quantity }),
        });
        if (res.ok) {
          const data = await res.json();
          setCart(data);
          return;
        }
      } catch {}
    }
    // Guest fallback
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id || i.product_id === product.id);
      if (existing) {
        return prev.map(i =>
          (i.id === product.id || i.product_id === product.id)
            ? { ...i, quantity: (i.quantity || i.qty || 1) + quantity }
            : i
        );
      }
      return [...prev, { ...product, product_id: product.id, quantity }];
    });
  }, []);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    const token = getToken();
    if (token) {
      try {
        const res = await fetch(`${BASE_URL}/api/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId, quantity }),
        });
        if (res.ok) { setCart(await res.json()); return; }
      } catch {}
    }
    setCart(prev => prev.map(i =>
      (i.product_id === productId || i.id === productId) ? { ...i, quantity } : i
    ));
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    const token = getToken();
    if (token) {
      try {
        const res = await fetch(`${BASE_URL}/api/cart/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) { setCart(await res.json()); return; }
      } catch {}
    }
    setCart(prev => prev.filter(i => i.product_id !== productId && i.id !== productId));
  }, []);

  const clearCart = useCallback(async () => {
    const token = getToken();
    if (token) {
      try {
        await fetch(`${BASE_URL}/api/cart`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    setCart([]);
    localStorage.removeItem('cart');
  }, []);

  const cartCount = cart.reduce((s, i) => s + (i.quantity || 1), 0);
  const cartTotal = cart.reduce((s, i) => s + parseFloat(i.price || 0) * (i.quantity || 1), 0);

  return (
    <CartContext.Provider value={{
      cart, cartCount, cartTotal, cartLoading,
      addToCart, removeFromCart, updateQuantity, clearCart, loadCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
