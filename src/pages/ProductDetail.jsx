/* ProductDetail.jsx - Amazon Style Redesign */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { FiStar as Star, FiChevronLeft as ChevronLeft, FiChevronRight as ChevronRight, FiShare2 as Share2, FiHeart as Heart, FiShield as ShieldCheck, FiTruck as Truck, FiRotateCcw as RotateCcw, FiLock as Lock, FiMapPin as MapPin, FiCheck as Check, FiInfo as Info, FiChevronDown as ChevronDown, FiShoppingCart as ShoppingCart } from 'react-icons/fi';
import { motion } from 'framer-motion';
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();
  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        setProduct(data);
        setError('');
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    getProduct();
    window.scrollTo(0, 0);
  }, [id]);
  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };
  const handleBuyNow = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    navigate('/cart');
  };
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !product) return <div className="p-10 text-center">{error || 'Product not found'}</div>;
  const images = product.images?.length > 0 ? product.images : [product.image].filter(Boolean);
  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  return (
    <div className="bg-white min-h-screen pb-12 font-sans antialiased">
      {/* Breadcrumb */}
      <div className="max-w-[1500px] mx-auto px-4 py-3 text-xs text-gray-600 flex items-center gap-1 overflow-x-auto whitespace-nowrap border-b border-gray-100">
        <Link to="/" className="hover:text-[#c45500] hover:underline">Home</Link>
        <ChevronRight size={12} className="text-gray-400" />
        <Link to="/shop" className="hover:text-[#c45500] hover:underline">Shop</Link>
        <ChevronRight size={12} className="text-gray-400" />
        <span className="text-gray-400 truncate max-w-[200px]">{product.name}</span>
      </div>
      <div className="max-w-[1500px] mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[340px_1fr_300px] gap-6">
        {/* Left: Images */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
            <img
              src={images[selectedImage] || images[0]}
              alt={product.name}
              className="w-full h-full object-contain p-4"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 w-full justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                onMouseEnter={() => setSelectedImage(idx)}
                onClick={() => setSelectedImage(idx)}
                className={`w-12 h-12 md:w-14 md:h-14 border-2 rounded p-1 flex-shrink-0 transition-all ${selectedImage === idx ? 'border-[#e77600] ring-2 ring-[#e77600]/20' : 'border-gray-200 hover:border-[#e77600]'}`}
              >
                <img src={img} alt="" className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>
        {/* Center: Product Info */}
        <div className="space-y-4">
          <h1 className="text-xl md:text-2xl font-semibold text-[#0f1111] leading-snug">{product.name}</h1>
          <p className="text-sm text-[#007185] hover:text-[#c7511f] cursor-pointer">Visit the Anritvox Store</p>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-[#FFA41C] text-[#FFA41C]" />)}
            </div>
            <span className="text-sm text-[#007185] hover:text-[#c7511f] cursor-pointer"> 426 ratings </span>
          </div>
          <hr />
          <div className="flex items-baseline gap-2 flex-wrap">
            {discount > 0 && <span className="bg-[#cc0c39] text-white text-xs font-bold px-2 py-0.5 rounded"> -{discount}% </span>}
            <span className="text-3xl font-bold text-[#0f1111]">
              <span className="text-base align-super text-sm font-medium">₹</span>
              <span>{product.price?.toLocaleString()}</span>
            </span>
          </div>
          {product.mrp && (
            <p className="text-sm text-gray-500">
              M.R.P.: <span className="line-through">₹{product.mrp?.toLocaleString()}</span>
            </p>
          )}
          <p className="text-sm text-[#007185]">FREE delivery</p>
          <hr />
          <div>
            <h3 className="font-semibold text-sm mb-2">About this item</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              {product.description?.split('\n').filter(l => l.length > 5).map((line, i) =>
                <li key={i}>{line}</li>
              ) || <li>Premium quality.</li>}
            </ul>
          </div>
        </div>
        {/* Right: Buy Box */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-fit space-y-4">
          <p className="text-2xl font-bold text-[#0f1111]">
            <span className="text-sm align-super">₹</span>
            <span>{product.price?.toLocaleString()}</span>
          </p>
          <p className="text-sm text-[#007600] font-semibold">In stock</p>
          {/* Quantity */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Qty:</span>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50"
            >
              {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <button
            onClick={handleAddToCart}
            className={`w-full py-2.5 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 ${addedToCart ? 'bg-green-500 text-white' : 'bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111]'}`}
          >
            {addedToCart ? <><Check size={16} /> Added to Cart</> : <><ShoppingCart size={16} /> Add to Cart</>}
          </button>
          <button
            onClick={handleBuyNow}
            className="w-full py-2.5 rounded-full font-bold text-sm bg-[#ffa41c] hover:bg-[#fa8900] text-[#0f1111] transition-all"
          >
            Buy Now
          </button>
          <hr />
          <div className="text-xs text-gray-600 space-y-1">
            <p>Ships from <span className="font-medium">Anritvox</span></p>
            <p>Sold by <span className="font-medium">Anritvox Store</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
