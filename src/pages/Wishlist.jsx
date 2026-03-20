import React from 'react';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
// FIXED: Wrapped in backticks to prevent syntax error
const FALLBACK = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E`;

function getImageUrl(product) {
  if (!product.images || product.images.length === 0) return FALLBACK;
  const img = product.images[0];
  if (img.startsWith('http')) return img;
  
  // Ensure the path correctly points to the uploads folder
  const cleanPath = img.replace(/^[\/\\]/, '');
  const finalPath = cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`;
  return `${BASE_URL}/${finalPath}`;
}

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="bg-slate-50 p-8 rounded-full mb-6">
          <Heart size={48} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your wishlist is empty</h2>
        <p className="text-slate-500 mb-8 text-center max-w-md">
          Save items you love to your wishlist. They will show up here so you can easily add them to your cart later.
        </p>
        <Link 
          to="/shop" 
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
        My Wishlist <span className="text-lg font-normal text-slate-400">({wishlist.length} items)</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div key={product._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-slate-50">
              <img
                src={getImageUrl(product)}
                alt={product.name}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
              <button
                onClick={() => removeFromWishlist(product._id)}
                className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                title="Remove from wishlist"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{product.category}</span>
              </div>
              <Link to={`/product/${product._id}`} className="block">
                <h3 className="font-bold text-slate-900 truncate hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
              </Link>
              <p className="text-lg font-bold text-slate-900 mt-2">${product.price}</p>
              
              <button
                onClick={() => addToCart(product)}
                className="w-full mt-4 bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
