import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { cart as cartApi } from "../services/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false); 
  const [upsells, setUpsells] = useState([]); 
  const { isAuthenticated } = useAuth();

  const loadCart = useCallback(async () => {
    if (isAuthenticated) {
      setCartLoading(true);
      try {
        const res = await cartApi.get();
        // Securely handle different backend response structures
        setCart(res.data?.items || res.data || []);
      } catch (err) {
        console.error("Cart sync failed:", err);
        setCart([]);
      } finally {
        setCartLoading(false);
      }
    } else {
      const saved = localStorage.getItem("anritvox_guest_cart");
      if (saved) setCart(JSON.parse(saved));
      else setCart([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = async (product, qty = 1) => {
    const prodId = product._id || product.id;
    if (isAuthenticated) {
      await cartApi.add({ productId: prodId, quantity: qty });
    } else {
      const updated = [...cart];
      const idx = updated.findIndex(i => i.product_id === prodId || i.id === prodId);
      if (idx > -1) updated[idx].quantity += qty;
      else updated.push({ product_id: prodId, id: prodId, product, quantity: qty });
      
      setCart(updated);
      localStorage.setItem("anritvox_guest_cart", JSON.stringify(updated));
    }
    await loadCart();
    setIsCartOpen(true); 
    
    // Dynamic Upsell Injection based on category
    if (product.category === 'Lights' || product.category_name === 'Lights') {
      setUpsells([{ _id: 'rel_1', name: 'Heavy Duty Wiring Relay', price: 499, img: '/logo.webp' }]);
    }
  };

  // NEW: Flawless Quantity Updater
  const updateQuantity = async (productId, newQty) => {
    if (newQty < 1) return removeFromCart(productId);
    
    if (isAuthenticated) {
      await cartApi.updateQuantity(productId, newQty);
    } else {
      const updated = [...cart];
      const idx = updated.findIndex(i => i.product_id === productId || i.id === productId);
      if (idx > -1) updated[idx].quantity = newQty;
      setCart(updated);
      localStorage.setItem("anritvox_guest_cart", JSON.stringify(updated));
    }
    await loadCart();
  };

  const removeFromCart = async (id) => {
    if (isAuthenticated) {
      await cartApi.remove(id);
    } else {
      const updated = cart.filter(i => i.product_id !== id && i.id !== id);
      setCart(updated);
      localStorage.setItem("anritvox_guest_cart", JSON.stringify(updated));
    }
    await loadCart();
  };
  
  const clearCart = async () => {
    if (isAuthenticated) {
      await cartApi.clear();
    } else {
      localStorage.removeItem("anritvox_guest_cart");
    }
    setCart([]);
  };

  // Highly accurate subtotal calculation referencing discount pricing first
  const getSubtotal = () => cart.reduce((acc, item) => {
    const p = item.product || item;
    const price = p.discount_price || p.price || item.unit_price || 0;
    return acc + (price * (item.quantity || 1));
  }, 0);
  
  const freeShippingThreshold = 5000;
  const shippingProgress = Math.min((getSubtotal() / freeShippingThreshold) * 100, 100);

  return (
    <CartContext.Provider value={{ 
      cartItems: cart, // Safe export mapping
      loading: cartLoading, 
      isCartOpen, 
      setIsCartOpen,
      addToCart, 
      updateQuantity, // Now injected into the ecosystem
      removeFromCart,
      clearCart,
      upsells,
      getSubtotal,
      shippingProgress,
      freeShippingThreshold,
      loadCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
