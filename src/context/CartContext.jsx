import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchCart, addToCartAPI, removeFromCartAPI, clearCartAPI } from '../services/api';

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
        const data = await fetchCart(token);
        setCart(data.items || []);
        return;
      } catch (error) {
        console.error("Cart fetch error:", error);
      } finally { 
        setCartLoading(false); 
      }
    }
    // Guest fallback
    try {
      const saved = localStorage.getItem('cart');
      setCart(saved ? JSON.parse(saved) : []);
    } catch {
      setCart([]);
    }
  }, []);

  // 🔴 UI FIX: Actually listen for the sync event from AuthContext
  useEffect(() => { 
    loadCart(); 
    
    const handleSync = () => loadCart();
    window.addEventListener('cart-synced', handleSync);
    
    return () => window.removeEventListener('cart-synced', handleSync);
  }, [loadCart]);

  // Persist guest cart
  useEffect(() => {
    if (!getToken()) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = useCallback(async (product, quantity = 1) => {
    const token = getToken();
    const pId = product.id || product.product_id;
    
    if (token) {
      try {
        const data = await addToCartAPI(token, pId, quantity);
        setCart(data.items || []);
        return;
      } catch (error) { 
        console.error("Error adding to cart:", error);
        throw error; // 🔴 UI FIX: Re-throw so components can show "Out of Stock" toasts
      }
    }
    
    // Guest fallback
    setCart(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const existing = safePrev.find(i => (i.id === pId || i.product_id === pId));
      if (existing) {
        return safePrev.map(i =>
          (i.id === pId || i.product_id === pId)
            ? { ...i, quantity: (i.quantity || i.qty || 1) + quantity }
            : i
        );
      }
      return [...safePrev, { ...product, product_id: pId, quantity }];
    });
  }, []);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    const token = getToken();
    if (token) {
      try {
        const data = await addToCartAPI(token, productId, quantity);
        setCart(data.items || []); 
        return; 
      } catch (error) { 
        console.error("Error updating quantity:", error);
        throw error; // 🔴 UI FIX: Re-throw for UI handling
      }
    }
    setCart(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.map(i =>
        (i.product_id === productId || i.id === productId) ? { ...i, quantity } : i
      );
    });
  }, [/* removeFromCart is referenced, let's keep it clean */]);

  const removeFromCart = useCallback(async (productId) => {
    const token = getToken();
    if (token) {
      try {
        const data = await removeFromCartAPI(token, productId);
        setCart(data.items || []); 
        return; 
      } catch (error) { 
        console.error(error); 
        throw error;
      }
    }
    setCart(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.filter(i => i.product_id !== productId && i.id !== productId);
    });
  }, []);

  const clearCart = useCallback(async () => {
    const token = getToken();
    if (token) {
      try { await clearCartAPI(token); } catch (error) { console.error(error); }
    }
    setCart([]);
    localStorage.removeItem('cart');
  }, []);

  const safeCart = Array.isArray(cart) ? cart : [];
  const cartCount = safeCart.reduce((s, i) => s + (i.quantity || 1), 0);
  const cartTotal = safeCart.reduce((s, i) => s + parseFloat(i.price || 0) * (i.quantity || 1), 0);

  return (
    <CartContext.Provider value={{
      cart: safeCart, cartCount, cartTotal, cartLoading,
      addToCart, removeFromCart, updateQuantity, clearCart, loadCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
