import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
// 100% PROPER IMPORT: Using the strictly mapped cart object
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
        const res = await cartApi.get(); // REWRITTEN
        setCart(res.data.items || res.data || []);
      } catch (err) {
        setCart([]);
      } finally {
        setCartLoading(false);
      }
    } else {
      const saved = localStorage.getItem("anritvox_guest_cart");
      if (saved) setCart(JSON.parse(saved));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = async (product, qty = 1) => {
    if (isAuthenticated) {
      await cartApi.add({ productId: product._id, quantity: qty }); // REWRITTEN
    } else {
      const updated = [...cart];
      const idx = updated.findIndex(i => i.product_id === product._id);
      if (idx > -1) updated[idx].quantity += qty;
      else updated.push({ product_id: product._id, product, quantity: qty });
      setCart(updated);
      localStorage.setItem("anritvox_guest_cart", JSON.stringify(updated));
    }
    loadCart();
    setIsCartOpen(true); 
    
    if (product.category === 'Lights') {
      setUpsells([{ _id: 'rel_1', name: 'Heavy Duty Wiring Relay', price: 499, img: 'https://via.placeholder.com/50' }]);
    }
  };

  const removeFromCart = async (id) => {
    if (isAuthenticated) {
      await cartApi.remove(id); // REWRITTEN
    } else {
      const updated = cart.filter(i => i.product_id !== id);
      setCart(updated);
      localStorage.setItem("anritvox_guest_cart", JSON.stringify(updated));
    }
    loadCart();
  };
  
  const clearCart = async () => {
    if (isAuthenticated) {
      await cartApi.clear(); // REWRITTEN
    } else {
      localStorage.removeItem("anritvox_guest_cart");
    }
    setCart([]);
  };

  const getSubtotal = () => cart.reduce((acc, item) => acc + ((item.product?.price || item.unit_price || 0) * item.quantity), 0);
  const freeShippingThreshold = 5000;
  const shippingProgress = Math.min((getSubtotal() / freeShippingThreshold) * 100, 100);

  return (
    <CartContext.Provider value={{ 
      cartItems: cart, 
      loading: cartLoading, 
      isCartOpen, 
      setIsCartOpen,
      addToCart, 
      removeFromCart,
      clearCart,
      upsells,
      getSubtotal,
      shippingProgress,
      freeShippingThreshold
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
