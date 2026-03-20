import React from 'react';
import { X, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
// FIXED: Wrapped in backticks to prevent syntax error
const FALLBACK = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E`;

function getImg(product) {
  if (!product?.images || product.images.length === 0) return FALLBACK;
  const img = product.images[0];
  if (img.startsWith('http')) return img;
  
  const cleanPath = img.replace(/^[\/\\]/, '');
  const finalPath = cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`;
  return `${BASE_URL}/${finalPath}`;
}

export default function Compare({ items = [], onRemove }) {
  const { addToCart } = useCart();

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Comparison list is empty</h2>
        <p className="text-slate-500 mb-8">Add products from the shop to compare their features.</p>
        <Link to="/shop" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
          Browse Products
        </Link>
      </div>
    );
  }

  const features = [
    { label: 'Price', key: 'price', format: (v) => `$${v}` },
    { label: 'Category', key: 'category' },
    { label: 'Brand', key: 'brand' },
    { label: 'Stock Status', key: 'countInStock', format: (v) => v > 0 ? 'In Stock' : 'Out of Stock' }
  ];

  return (
    <div className="overflow-x-auto pb-8">
      <div className="min-w-[800px] grid grid-cols-5 gap-4">
        {/* Labels Column */}
        <div className="col-span-1 pt-[280px] space-y-8">
          {features.map(f => (
            <div key={f.label} className="h-12 flex items-center text-sm font-bold text-slate-400 uppercase tracking-wider">
              {f.label}
            </div>
          ))}
        </div>

        {/* Product Columns */}
        {items.map((product) => (
          <div key={product._id} className="col-span-1 bg-white rounded-3xl p-6 border border-slate-100 relative group">
            <button 
              onClick={() => onRemove(product._id)}
              className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="aspect-square mb-6 rounded-2xl overflow-hidden bg-slate-50">
              <img 
                src={getImg(product)} 
                alt={product.name} 
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform" 
              />
            </div>

            <h3 className="font-bold text-slate-900 mb-4 h-12 line-clamp-2">{product.name}</h3>

            <div className="space-y-8">
              {features.map(f => (
                <div key={f.label} className="h-12 flex items-center font-semibold text-slate-700 border-t border-slate-50">
                  {f.format ? f.format(product[f.key]) : product[f.key] || 'N/A'}
                </div>
              ))}
            </div>

            <button
              onClick={() => addToCart(product)}
              className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
            >
              <ShoppingCart size={18} /> Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
