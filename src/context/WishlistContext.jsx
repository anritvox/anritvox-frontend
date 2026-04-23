import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
// 100% PROPER
import { wishlist as wishlistApi } from '../services/api';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user, token } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

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
      const res = await wishlistApi.get(); // REWRITTEN
      const data = res.data;
      setWishlist(Array.isArray(data) ? data : (data.wishlist || data.items || []));
    } catch (e) {
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
          await wishlistApi.remove(pid); // REWRITTEN
          setWishlist(prev => prev.filter(item => (item.id || item.product_id || item._id) != pid));
        } else {
          await wishlistApi.add(pid); // REWRITTEN
          setWishlist(prev => [...prev, product]);
        }
      } catch (e) {
        console.error('Wishlist error:', e);
      }
    } else {
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
