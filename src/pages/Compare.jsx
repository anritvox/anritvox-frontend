import React from 'react';
import { X, ShoppingCart, Check, AlertCircle, Zap, Shield, Star, Info, List, Truck, RefreshCw, BarChart3, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
const FALLBACK = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E`;

function getImg(product) {
  if (!product?.images || product.images.length === 0) return FALLBACK;
  const img = product.images[0];
  if (img.startsWith('http')) return img;
  const cleanPath = img.replace(/^[\\\/]+/, '');
  const finalPath = cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`;
  return `${BASE_URL}/${finalPath}`;
}

export default function Compare({ items = [], onRemove }) {
  const { addToCart } = useCart();

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={48} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Comparison list is empty</h2>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">Add products from the shop to compare their technical specifications and features side-by-side.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all group">
          Browse Products
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  const features = [
    { label: 'Basic Information', type: 'header' },
    { label: 'Price', key: 'price', format: (v) => `₹${v?.toLocaleString()}` },
    { label: 'Category', key: 'category' },
    { label: 'Brand', key: 'brand' },
    { label: 'Stock Status', key: 'countInStock', format: (v) => v > 0 ? <span className="text-emerald-600 font-semibold flex items-center gap-1"><Check size={16}/> In Stock</span> : <span className="text-rose-500 font-semibold flex items-center gap-1"><X size={16}/> Out of Stock</span> },
    
    { label: 'Technical Specifications', type: 'header' },
    { label: 'Power Output', key: 'powerOutput', format: (v) => v ? `${v}W RMS` : 'N/A' },
    { label: 'Frequency Response', key: 'freqResponse', format: (v) => v || 'N/A' },
    { label: 'Sensitivity', key: 'sensitivity', format: (v) => v ? `${v}dB` : 'N/A' },
    { label: 'Impedance', key: 'impedance', format: (v) => v ? `${v} Ohms` : 'N/A' },
    
    { label: 'Features & Warranty', type: 'header' },
    { label: 'Warranty Period', key: 'warranty', format: (v) => v || '1 Year Standard' },
    { label: 'E-Warranty Support', key: 'hasEWarranty', format: (v) => v !== false ? <Check size={18} className="text-emerald-500"/> : <X size={18} className="text-slate-300"/> },
    { label: 'Return Policy', key: 'returnPolicy', format: (v) => v || '7 Days Replacement' },
    { label: 'Shipping', key: 'shippingInfo', format: (v) => v || 'Free Delivery' }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[1000px]">
          {/* Header Row */}
          <div className="grid grid-cols-5 border-b border-slate-100">
            <div className="p-8 bg-slate-50/50 flex items-center">
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Features Comparison</h3>
            </div>
            {items.map((product) => (
              <div key={product._id} className="p-8 relative group border-l border-slate-100">
                <button 
                  onClick={() => onRemove(product._id)}
                  className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all z-10"
                  title="Remove from comparison"
                >
                  <X size={16} />
                </button>
                <div className="aspect-square rounded-2xl bg-slate-50 mb-6 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  <img src={getImg(product)} alt={product.name} className="w-full h-full object-contain p-4" />
                </div>
                <h3 className="font-bold text-slate-900 leading-tight mb-2 line-clamp-2 min-h-[3rem]">{product.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.round(product.rating || 4.5) ? 'currentColor' : 'none'} />)}
                  </div>
                  <span className="text-xs text-slate-400">({product.numReviews || 0})</span>
                </div>
                <button 
                  onClick={() => addToCart(product)}
                  disabled={product.countInStock === 0}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    product.countInStock > 0 
                    ? 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart size={18} />
                  {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            ))}
            {/* Fill empty slots if less than 4 products */}
            {[...Array(Math.max(0, 4 - items.length))].map((_, i) => (
              <div key={`empty-${i}`} className="p-8 border-l border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-200">
                  <Zap size={32} />
                </div>
                <p className="text-sm text-slate-400">Add another product<br/>to compare</p>
                <Link to="/shop" className="mt-4 text-slate-900 font-bold text-sm hover:underline">Browse Shop</Link>
              </div>
            ))}
          </div>

          {/* Features Rows */}
          {features.map((f, idx) => (
            f.type === 'header' ? (
              <div key={idx} className="grid grid-cols-5 bg-slate-50/80">
                <div className="col-span-5 px-8 py-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{f.label}</span>
                </div>
              </div>
            ) : (
              <div key={idx} className="grid grid-cols-5 border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                <div className="p-6 flex items-center border-r border-slate-50">
                  <span className="text-sm font-medium text-slate-500">{f.label}</span>
                </div>
                {items.map((product) => (
                  <div key={`${product._id}-${f.key}`} className="p-6 flex items-center justify-center text-center border-l border-slate-50">
                    <div className="text-sm font-semibold text-slate-700">
                      {f.format ? f.format(product[f.key]) : product[f.key] || <span className="text-slate-300">—</span>}
                    </div>
                  </div>
                ))}
                {/* Empty slots for features */}
                {[...Array(Math.max(0, 4 - items.length))].map((_, i) => (
                  <div key={`empty-feat-${idx}-${i}`} className="p-6 border-l border-slate-50" />
                ))}
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
