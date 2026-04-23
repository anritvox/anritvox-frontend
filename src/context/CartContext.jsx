import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { fetchCart, addToCartAPI, removeFromCartAPI, clearCartAPI } from "../services/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false); // Phase 2: Slide-out
  const [upsells, setUpsells] = useState([]); // Phase 2: In-cart upsells
  const { isAuthenticated } = useAuth();

  const loadCart = useCallback(async () => {
    if (isAuthenticated) {
      setCartLoading(true);
      try {
        const res = await fetchCart();
        setCart(res.data.items || []);
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
      await addToCartAPI(product._id, qty);
    } else {
      const updated = [...cart];
      const idx = updated.findIndex(i => i.product_id === product._id);
      if (idx > -1) updated[idx].quantity += qty;
      else updated.push({ product_id: product._id, product, quantity: qty });
      setCart(updated);
      localStorage.setItem("anritvox_guest_cart", JSON.stringify(updated));
    }
    loadCart();
    setIsCartOpen(true); // Auto-open mini-cart on add
    
    // Logic for upsells
    if (product.category === 'Lights') {
      setUpsells([{ _id: 'rel_1', name: 'Heavy Duty Wiring Relay', price: 499, img: 'https://via.placeholder.com/50' }]);
    }
  };

  const removeFromCart = async (id) => {
    if (isAuthenticated) await removeFromCartAPI(id);
    else {
      const updated = cart.filter(i => i.product_id !== id);
      setCart(updated);
      localStorage.setItem("anritvox_guest_cart", JSON.stringify(updated));
    }
    loadCart();
  };

  const getSubtotal = () => cart.reduce((acc, item) => acc + (item.product?.price * item.quantity), 0);
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
