import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, ShoppingCart } from 'lucide-react';

const STORAGE_KEY = 'anritvox_recently_viewed';
const MAX_ITEMS = 8;

export function addToRecentlyViewed(product) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = stored.filter(p => p.id !== product.id && p._id !== product.id);
    
    const itemToAdd = {
      id: product.id || product._id,
      name: product.name,
      image: product.images?.[0] || product.image || product.file_path,
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
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setItems(stored.filter(p => String(p.id) !== String(currentId)));
    } catch (err) {
      setItems([]);
    }
  }, [currentId]);

  if (!items.length) return null;

  return (
    <section className="py-12 px-4 bg-[#050505]/50 rounded-3xl border border-gray-900 mb-12">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
            <Clock className="text-cyan-400" size={20} />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Recently Viewed</h3>
        </div>
        <button 
          onClick={() => { localStorage.removeItem(STORAGE_KEY); setItems([]); }}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors uppercase tracking-widest font-bold"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map(item => {
          const selling = item.discount_price ? Number(item.discount_price) : Number(item.price);
          const original = Number(item.price);
          const discount = item.discount_price ? Math.round(((original - selling) / original) * 100) : 0;

          return (
            <div 
              key={item.id} 
              className="group relative bg-gray-950 border border-gray-900 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10"
            >
              <Link to={`/product/${item.slug || item.id}`} className="block">
                <div className="aspect-square bg-gray-900 overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                      -{discount}%
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="text-white" size={24} />
                  </div>
                </div>

                <div className="p-3">
                  <h4 className="text-gray-300 text-xs font-medium truncate group-hover:text-cyan-400 transition-colors">
                    {item.name}
                  </h4>
                  <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-white font-bold text-sm">₹{selling.toLocaleString()}</span>
                    {discount > 0 && (
                      <span className="text-gray-600 text-[10px] line-through">₹{original.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
