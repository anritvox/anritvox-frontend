// src/components/QuickViewModal.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiShoppingCart, FiHeart, FiStar, FiCheck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const FALLBACK = 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=400&q=60';

export default function QuickViewModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImg, setSelectedImg] = useState(0);

  if (!product) return null;

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map(i => typeof i === 'string' ? i : i.url)
    : [product.image || FALLBACK];

  const price = Number(product.discount_price || product.price || 0);
  const original = Number(product.price || 0);
  const discount = product.discount_price && original > 0
    ? Math.round(((original - price) / original) * 100) : 0;

  const handleAdd = async () => {
    await addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
        >
          <FiX size={18} />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Images */}
          <div className="p-6">
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
              <img
                src={images[selectedImg]}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={e => { e.currentTarget.src = FALLBACK; e.currentTarget.onerror = null; }}
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${selectedImg === i ? 'border-gray-900' : 'border-gray-200 opacity-60'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" onError={e => { e.currentTarget.src = FALLBACK; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 flex flex-col gap-4">
            {product.category && (
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                {typeof product.category === 'object' ? product.category.name : product.category}
              </span>
            )}
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{product.name}</h2>

            {/* Rating */}
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} size={14} className={i < Math.round(product.rating || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
              ))}
              {product.reviewCount && <span className="text-xs text-gray-500">({product.reviewCount} reviews)</span>}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-gray-900">₹{price.toLocaleString()}</span>
              {discount > 0 && (
                <>
                  <span className="text-sm line-through text-gray-400">₹{original.toLocaleString()}</span>
                  <span className="text-sm font-bold text-green-600">{discount}% OFF</span>
                </>
              )}
            </div>

            {/* Description snippet */}
            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{product.description}</p>
            )}

            {/* Variant selection if variants exist */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Options</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <span key={i} className="px-3 py-1 border border-gray-300 rounded-full text-xs font-medium text-gray-700 cursor-pointer hover:border-gray-900 transition-colors">
                      {v.name || v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Add to cart */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-50 font-bold">-</button>
                <span className="px-4 py-2 text-sm font-bold text-gray-900 min-w-[40px] text-center">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 text-gray-600 hover:bg-gray-50 font-bold">+</button>
              </div>
              <button
                onClick={handleAdd}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  added ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-700'
                }`}
              >
                {added ? <FiCheck size={16} /> : <FiShoppingCart size={16} />}
                {added ? 'Added!' : 'Add to Cart'}
              </button>
            </div>

            <Link
              to={`/product/${product._id || product.id}`}
              onClick={onClose}
              className="text-center text-sm text-gray-500 hover:text-gray-900 underline underline-offset-2 transition-colors"
            >
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
