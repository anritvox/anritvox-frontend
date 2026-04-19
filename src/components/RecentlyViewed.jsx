import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, ShoppingCart, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'anritvox_recently_viewed';
const MAX_ITEMS = 8;

export function addToRecentlyViewed(product) {
  if (!product) return;
  try {
    const productId = String(product.id || product._id);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = stored.filter(p => String(p.id || p._id) !== productId);
    const itemToAdd = {
      id: productId,
      name: product.name,
      image: Array.isArray(product.images) ? product.images[0] : (product.image || product.file_path),
      price: product.price,
      discount_price: product.discount_price,
      slug: product.slug
    };
    const updated = [itemToAdd, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error adding to recently viewed:', err);
  }
}

export default function RecentlyViewed({ currentId }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    loadItems();
    window.addEventListener('storage', loadItems);
    return () => window.removeEventListener('storage', loadItems);
  }, [currentId]);
  const loadItems = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const cid = String(currentId);
      setItems(stored.filter(p => String(p.id || p._id) !== cid));
    } catch (err) { setItems([]); }
  };
  const clearAll = () => { localStorage.removeItem(STORAGE_KEY); setItems([]); };
  if (!items.length) return null;
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-transparent to-[#050505]/30 rounded-[3rem] border border-white/5 mb-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-cyan-500/5 blur-[120px] rounded-full -z-10 opacity-30" />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10 px-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]"><Clock className="text-cyan-400" size={24} /></div>
            <div><h3 className="text-2xl font-black text-white tracking-tighter uppercase">Recently Viewed</h3><p className="text-gray-500 text-xs font-bold tracking-widest uppercase mt-0.5">Pick up where you left off</p></div>
          </div>
          <button onClick={clearAll} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all border border-white/5 hover:border-red-500/20 text-[10px] font-black uppercase tracking-widest"><Trash2 size={14} />Clear History</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 px-2">
          <AnimatePresence mode="popLayout">
            {items.map((item, idx) => {
              const selling = item.discount_price ? Number(item.discount_price) : Number(item.price);
              const original = Number(item.price);
              const discount = item.discount_price ? Math.round(((original - selling) / original) * 100) : 0;
              return (
                <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: idx * 0.05 }} key={item.id} className="group relative bg-[#080808] border border-gray-900 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/5 active:scale-95">
                  <Link to={`/product/${item.slug || item.id}`} className="block">
                    <div className="aspect-[4/5] bg-[#0A0A0A] overflow-hidden relative p-3"><img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-lighten transition-transform duration-700 group-hover:scale-110" loading="lazy" />{discount > 0 && (<div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-xl uppercase tracking-tighter z-10">{discount}% OFF</div>)}</div>
                    <div className="p-3 bg-gradient-to-t from-black to-[#080808]"><h4 className="text-gray-400 text-[10px] font-bold truncate group-hover:text-white transition-colors uppercase tracking-tight mb-1">{item.name}</h4><div className="flex items-center gap-1.5"><span className="text-white font-black text-xs">₹{selling.toLocaleString()}</span>{discount > 0 && (<span className="text-gray-700 text-[9px] line-through font-bold">₹{original.toLocaleString()}</span>)}</div></div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
