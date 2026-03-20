import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
const FALLBACK = 'data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E';

function getImageUrl(product) {
  const raw = product.images || product.image || [];
  const arr = Array.isArray(raw) ? raw : [raw];
  const img = arr[0];
  if (!img) return FALLBACK;
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  const clean = img.replace(/^\//, '');
  return `${BASE_URL.replace(/\/$/, '')}/${clean.startsWith('uploads/') ? clean : 'uploads/' + clean}`;
}

export default function Wishlist() {
  const { wishlist, toggleWishlist, count } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
  };

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Wishlist</h1>
            <p className="text-gray-400 mt-1">{count} {count === 1 ? 'item' : 'items'} saved</p>
          </div>
          <Link to="/shop" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
            Continue Shopping →
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-16 text-center">
            <div className="text-8xl mb-6">❤️</div>
            <h3 className="text-2xl font-bold text-white mb-3">Your wishlist is empty</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Save items you love by clicking the heart icon on any product.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => {
              const pid = product.id || product._id;
              const price = product.discount_price || product.price || 0;
              const originalPrice = product.price || 0;
              const discount = product.discount_price && originalPrice > 0
                ? Math.round(((originalPrice - product.discount_price) / originalPrice) * 100)
                : 0;

              return (
                <div key={pid} className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-cyan-500/50 transition-all duration-300 group">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-white">
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.src = FALLBACK; }}
                    />
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{discount}%
                      </span>
                    )}
                    <button
                      onClick={() => toggleWishlist(product)}
                      className="absolute top-3 right-3 w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                      title="Remove from wishlist"
                    >
                      ♥
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <Link to={`/product/${pid}`}>
                      <h3 className="text-white font-medium text-sm line-clamp-2 hover:text-cyan-400 transition-colors mb-2">
                        {product.name || 'Unknown Product'}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-cyan-400 font-bold text-lg">₹{Number(price).toLocaleString()}</span>
                      {discount > 0 && (
                        <span className="text-gray-500 text-sm line-through">₹{Number(originalPrice).toLocaleString()}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                      >
                        Add to Cart
                      </button>
                      <Link
                        to={`/product/${pid}`}
                        className="flex-1 border border-gray-600 hover:border-cyan-500 text-gray-300 hover:text-cyan-400 text-sm font-semibold py-2.5 rounded-xl text-center transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
