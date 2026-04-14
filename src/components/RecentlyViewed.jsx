import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

const STORAGE_KEY = 'anritvox_recently_viewed';
const MAX_ITEMS = 6;

export function addToRecentlyViewed(product) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = stored.filter(p => p.id !== product.id);
    const updated = [{ id: product.id, name: product.name, image: product.images?.[0] || product.image, price: product.price, discount_price: product.discount_price }, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export default function RecentlyViewed({ currentId }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setItems(stored.filter(p => String(p.id) !== String(currentId)));
    } catch {}
  }, [currentId]);

  if (!items.length) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <Clock size={18} className="text-gray-400" />
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Recently Viewed</h3>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map(item => {
          const selling = item.discount_price ? Number(item.discount_price) : Number(item.price);
          return (
            <Link
              key={item.id}
              to={`/product/${item.id}`}
              className="min-w-[160px] flex flex-col gap-3 p-4 rounded-2xl border border-gray-100 hover:border-gray-900 hover:shadow-lg transition-all group"
            >
              <div className="w-full aspect-square bg-gray-50 rounded-xl overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug">{item.name}</p>
                <p className="text-sm font-black text-gray-900 mt-1">₹{selling.toLocaleString()}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
