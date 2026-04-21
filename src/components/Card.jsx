import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { BASE_URL } from '../services/api';

export default function Card({ product }) {
  const { addToCart } = useCart();

  // Bulletproof image resolver
  const resolveImageUrl = (path) => {
    if (!path || typeof path !== 'string') return '/logo.webp';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^[\/\\]/, '').replace(/^uploads[\/\\]/, '');
    return `${BASE_URL}/uploads/${cleanPath}`;
  };

  const imageUrl = resolveImageUrl(product.images?.[0] || product.image_url || '');

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <Link 
      to={`/product/${product.id}`} 
      className="group bg-[#0a0c10] border border-white/5 rounded-3xl overflow-hidden hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all block relative flex flex-col h-full"
    >
      {/* Stock / Status Badge */}
      <div className="absolute top-4 right-4 z-10 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-[9px] font-black text-white uppercase tracking-widest">
        {product.quantity > 0 ? 'IN STOCK' : <span className="text-red-400">OFFLINE</span>}
      </div>

      {/* Image Container */}
      <div className="aspect-square bg-black relative overflow-hidden flex items-center justify-center p-6">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-full h-full object-contain opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
          onError={(e) => { e.target.src = '/logo.webp'; e.target.style.opacity = '0.3'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-transparent opacity-80" />
      </div>

      {/* Content Container */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">{product.brand || 'ANRITVOX CORE'}</div>
        <h3 className="font-bold text-white text-lg tracking-tight mb-2 group-hover:text-purple-400 transition-colors line-clamp-2 flex-grow">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <span className="font-black text-xl text-white">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
          <button 
            onClick={handleAddToCart}
            disabled={product.quantity <= 0}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-purple-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-400"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
