//cart
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { fetchCart, addToCartAPI, removeFromCartAPI, clearCartAPI } from "../services/api";

const CartContext = createContext();

// Helper: get effective unit price from a cart item (handles both backend & guest formats)
const getItemPrice = (item) =>
  parseFloat(item.unit_price ?? item.discount_price ?? item.price ?? 0);

// Helper: get product id from cart item regardless of field name
const getItemId = (item) => item.product_id ?? item._id ?? item.id;

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const loadCart = useCallback(async () => {
    if (isAuthenticated) {
      setCartLoading(true);
      try {
        const data = await fetchCart();
        setCart(data.items || []);
      } catch (error) {
        setCart([]);
      } finally {
        setCartLoading(false);
      }
    } else {
      const saved = localStorage.getItem("guest_cart");
      try {
        setCart(saved ? JSON.parse(saved) : []);
      } catch {
        setCart([]);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCart();
    window.addEventListener("cart-synced", loadCart);
    return () => window.removeEventListener("cart-synced", loadCart);
  }, [loadCart]);

  const addToCart = useCallback(async (product, quantity = 1) => {
    const pId = product._id || product.id || product.product_id;
    if (isAuthenticated) {
      try {
        const data = await addToCartAPI(pId, quantity);
        setCart(data.items || []);
      } catch (error) {
        throw error;
      }
    } else {
      setCart(prev => {
        const existing = prev.find(i => getItemId(i) === pId);
        let newCart;
        if (existing) {
          newCart = prev.map(i =>
            getItemId(i) === pId ? { ...i, quantity: (i.quantity || 1) + quantity } : i
          );
        } else {
          newCart = [...prev, { ...product, quantity }];
        }
        localStorage.setItem("guest_cart", JSON.stringify(newCart));
        return newCart;
      });
    }
  }, [isAuthenticated]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    if (isAuthenticated) {
      try {
        const data = await addToCartAPI(productId, quantity);
        setCart(data.items || []);
      } catch (error) {
        throw error;
      }
    } else {
      setCart(prev => {
        const newCart = prev.map(i =>
          getItemId(i) === productId ? { ...i, quantity } : i
        );
        localStorage.setItem("guest_cart", JSON.stringify(newCart));
        return newCart;
      });
    }
  }, [isAuthenticated]);

  const removeFromCart = useCallback(async (productId) => {
    if (isAuthenticated) {
      try {
        const data = await removeFromCartAPI(productId);
        setCart(data.items || []);
      } catch (error) {
        throw error;
      }
    } else {
      setCart(prev => {
        const newCart = prev.filter(i => getItemId(i) !== productId);
        localStorage.setItem("guest_cart", JSON.stringify(newCart));
        return newCart;
      });
    }
  }, [isAuthenticated]);

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await clearCartAPI();
      } catch (error) {
        console.error(error);
      }
    }
    setCart([]);
    localStorage.removeItem("guest_cart");
  }, [isAuthenticated]);

  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  // Use subtotal if available (server-computed), otherwise compute from unit_price/price
  const cartTotal = cart.reduce((total, item) => {
    if (item.subtotal != null) return total + parseFloat(item.subtotal);
    return total + getItemPrice(item) * (item.quantity || 1);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        cartLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        reloadCart: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
