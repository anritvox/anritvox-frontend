// QuickViewModal - Revamped with modern UI and lucide-react icons
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingCart, Heart, Star, Check, Minus, Plus, ExternalLink, Tag, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';

const FALLBACK = 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=400&q=60';

export default function QuickViewModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImg, setSelectedImg] = useState(0);

  if (!product) return null;

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map(i => typeof i === 'string' ? i : i.url || i.file_path)
    : [product.image || FALLBACK];

  const price = Number(product.discount_price || product.price || 0);
  const original = Number(product.price || 0);
  const discount = product.discount_price && original > 0
    ? Math.round(((original - price) / original) * 100)
    : 0;

  const handleAdd = async () => {
    try {
      await addToCart(product, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Add to cart error:', err);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0d0d0d] border border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/60 animate-in zoom-in-95 duration-300"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Left: Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group">
              {discount > 0 && (
                <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <Tag size={12} />
                  {discount}% OFF
                </div>
              )}
              <img
                src={images[selectedImg]}
                alt={product.name}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK;
                  e.currentTarget.onerror = null;
                }}
              />
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImg === i
                        ? 'border-cyan-500 ring-2 ring-cyan-500/30'
                        : 'border-gray-700 opacity-60 hover:opacity-100 hover:border-gray-600'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = FALLBACK; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col gap-4">
            {/* Category Badge */}
            {product.category && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/30 w-fit">
                <Package size={12} />
                {typeof product.category === 'object' ? product.category.name : product.category}
              </span>
            )}

            {/* Product Name */}
            <h2 className="text-2xl font-bold text-white leading-tight">
              {product.name}
            </h2>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={`${
                        i < Math.round(product.rating || 4)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-600 fill-gray-600'
                      }`}
                    />
                  ))}
                </div>
                {product.reviewCount && (
                  <span className="text-xs text-gray-500">({product.reviewCount} reviews)</span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 py-2">
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                ₹{price.toLocaleString()}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    ₹{original.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/30">
                    Save ₹{(original - price).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                  {product.description}
                </p>
              </div>
            )}

            {/* Stock Status */}
            {product.quantity !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                {product.quantity > 0 ? (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 font-medium">
                      In Stock ({product.quantity} available)
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-400 rounded-full" />
                    <span className="text-red-400 font-medium">Out of Stock</span>
                  </>
                )}
              </div>
            )}

            {/* Variant Options */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Options</h4>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <button
                      key={i}
                      className="px-3 py-1.5 text-sm border border-gray-700 rounded-lg text-gray-300 hover:border-cyan-500 hover:text-cyan-400 transition-colors"
                    >
                      {v.name || v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-800">
              {/* Quantity Selector */}
              <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  disabled={qty <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="px-6 py-3 text-white font-semibold border-x border-gray-700">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAdd}
                disabled={added || (product.quantity !== undefined && product.quantity === 0)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all shadow-lg ${
                  added
                    ? 'bg-green-600 text-white shadow-green-500/30'
                    : 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-cyan-500/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {added ? (
                  <>
                    <Check size={20} />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>

            {/* View Full Details Link */}
            <Link
              to={`/product/${product.slug || product.id}`}
              onClick={onClose}
              className="flex items-center justify-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors py-2"
            >
              <ExternalLink size={14} />
              <span>View Full Details</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
