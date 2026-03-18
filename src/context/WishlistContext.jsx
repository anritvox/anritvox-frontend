import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user, token } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist from localStorage for guests, API for logged-in users
  useEffect(() => {
    if (user && token) {
      fetchWishlistFromAPI();
    } else {
      const stored = localStorage.getItem('guest_wishlist');
      setWishlist(stored ? JSON.parse(stored) : []);
    }
  }, [user, token]);

  const fetchWishlistFromAPI = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWishlist(Array.isArray(data) ? data : (data.wishlist || data.items || []));
      }
    } catch (e) {
      // Fallback to localStorage
      const stored = localStorage.getItem('guest_wishlist');
      setWishlist(stored ? JSON.parse(stored) : []);
    } finally {
      setLoading(false);
    }
  };

  const isWishlisted = useCallback((productId) => {
    return wishlist.some(item => (item.id || item.product_id || item._id) == productId || item == productId);
  }, [wishlist]);

  const toggleWishlist = useCallback(async (product) => {
    const pid = product.id || product._id;
    const alreadyIn = isWishlisted(pid);

    if (user && token) {
      try {
        if (alreadyIn) {
          await fetch(`${BASE_URL}/api/wishlist/${pid}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          setWishlist(prev => prev.filter(item => (item.id || item.product_id || item._id) != pid));
        } else {
          await fetch(`${BASE_URL}/api/wishlist`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: pid }),
          });
          setWishlist(prev => [...prev, product]);
        }
      } catch (e) {
        console.error('Wishlist error:', e);
      }
    } else {
      // Guest: use localStorage
      let updated;
      if (alreadyIn) {
        updated = wishlist.filter(item => (item.id || item._id) != pid);
      } else {
        updated = [...wishlist, product];
      }
      setWishlist(updated);
      localStorage.setItem('guest_wishlist', JSON.stringify(updated));
    }
  }, [wishlist, user, token, isWishlisted]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    localStorage.removeItem('guest_wishlist');
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlist, loading, isWishlisted, toggleWishlist, clearWishlist, count: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}

export default WishlistContext;
