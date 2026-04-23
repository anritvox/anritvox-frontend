import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Heart, CheckCircle, AlertCircle, Star, Zap, Layers } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Card({ product }) {
  const { addToCart } = useCart();
  const [garage, setGarage] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('anritvox_garage');
    if (stored) setGarage(JSON.parse(stored));
    
    const handleStorage = () => {
      const updated = localStorage.getItem('anritvox_garage');
      setGarage(updated ? JSON.parse(updated) : null);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (!product) return null;

  // Mock fitment logic: In real app, this would check against product.compatibleVehicles
  const isCompatible = garage && (product.category === 'Lights' || product.category === 'Audio');

  return (
    <div className="group relative bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden transition-all hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]">
      
      {/* Fitment Badge */}
      {garage && (
        <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full flex items-center space-x-2 backdrop-blur-md border ${
          isCompatible ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800/50 border-slate-700 text-slate-500 opacity-50'
        }`}>
          {isCompatible ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
          <span className="text-[8px] font-black uppercase tracking-widest leading-none">
            {isCompatible ? `Fits ${garage.year} ${garage.model}` : `Might not fit ${garage.model}`}
          </span>
        </div>
      )}

      {/* Image Container */}
      <div className="aspect-[4/5] overflow-hidden relative">
        <img 
          src={product.images?.[0] || 'https://via.placeholder.com/400x500'} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
          alt={product.name} 
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
           <button className="p-4 bg-white text-black rounded-full hover:bg-emerald-500 transition-all hover:-translate-y-1">
             <Heart size={20} />
           </button>
           <Link to={`/product/${product._id}`} className="p-4 bg-white text-black rounded-full hover:bg-emerald-500 transition-all hover:-translate-y-1">
             <Eye size={20} />
           </Link>
           <button className="p-4 bg-white text-black rounded-full hover:bg-emerald-500 transition-all hover:-translate-y-1">
             <Layers size={20} />
           </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-8 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-1">{product.category}</div>
            <h3 className="text-xl font-black uppercase tracking-tighter leading-tight text-white group-hover:text-emerald-400 transition-colors">
              {product.name}
            </h3>
          </div>
          <div className="text-right">
             <div className="text-xl font-black text-emerald-500 font-mono italic tracking-tighter">₹{product.price}</div>
             {product.oldPrice && <div className="text-xs text-slate-600 line-through font-bold">₹{product.oldPrice}</div>}
          </div>
        </div>

        <div className="flex items-center justify-between">
           <div className="flex items-center space-x-1">
             {[...Array(5)].map((_, i) => (
               <Star key={i} size={10} className={i < (product.ratings || 4) ? 'text-emerald-500 fill-emerald-500' : 'text-slate-800'} />
             ))}
             <span className="text-[10px] font-bold text-slate-600 ml-2">({product.numReviews || 12})</span>
           </div>
           <div className="flex items-center space-x-2">
              <Zap size={14} className="text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Flash Sale</span>
           </div>
        </div>

        <button 
          onClick={() => addToCart(product)}
          className="w-full mt-4 bg-slate-800 text-white py-4 rounded-2xl font-black uppercase tracking-tighter text-sm flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all"
        >
          <ShoppingCart size={18} className="mr-2" /> Add to Cart
        </button>
      </div>
    </div>
  );
}
