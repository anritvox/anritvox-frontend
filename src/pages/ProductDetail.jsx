/* ProductDetail.jsx - Amazon Style Redesign */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { Star, ChevronLeft, ChevronRight, Share2, Heart, ShieldCheck, Truck, RotateCcw, Lock, MapPin, Check, Info, ChevronDown, ShoppingCart } from 'lucide-react';
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
        <Link to="/" className="hover:text-[#c45500] hover:underline text-xs">Home</Link>
        <ChevronRight size={12} />
        <Link to="/shop" className="hover:text-[#c45500] hover:underline text-xs">Shop</Link>
        <ChevronRight size={12} />
        <span className="text-gray-400 truncate">{product.name}</span>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 relative">
        {/* Left: Images */}
        <div className="lg:col-span-5 flex flex-col-reverse md:flex-row gap-4 sticky top-4 self-start">
          <div className="flex md:flex-col gap-2 overflow-auto md:overflow-visible no-scrollbar pb-2 md:pb-0">
            {images.map((img, idx) => (
              <button key={idx} onMouseEnter={() => setSelectedImage(idx)} onClick={() => setSelectedImage(idx)} className={`w-12 h-12 md:w-14 md:h-14 border-2 rounded p-1 flex-shrink-0 transition-all ${selectedImage === idx ? 'border-[#e77600] ring-2 ring-[#e77600]/20' : 'border-gray-200 hover:border-[#e77600]'}`}>
                <img src={img} alt="" className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
          <div className="flex-1 relative bg-gray-50 rounded-lg overflow-hidden min-h-[400px] md:pb-0 flex items-center justify-center border border-gray-100">
            <motion.img key={selectedImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={images[selectedImage]} alt={product.name} className="max-h-[500px] w-auto object-contain" />
          </div>
        </div>

        {/* Center: Product Info */}
        <div className="lg:col-span-4 space-y-3">
          <h1 className="text-xl font-medium text-[#0f1111] leading-snug">{product.name}</h1>
          <div className="text-blue-600 text-sm font-medium">Visit the Anritvox Store</div>
          <div className="flex items-center gap-2">
            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-[#e77600] text-[#e77600]" />)}</div>
            <span className="text-sm text-blue-600 hover:underline cursor-pointer">426 ratings</span>
          </div>
          <hr className="border-gray-200" />
          <div className="space-y-1">
            {discount > 0 && <span className="text-red-600 text-sm font-bold">-{discount}%</span>}
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-600">₹</span>
              <span className="text-3xl font-light text-[#0f1111]">{product.price?.toLocaleString()}</span>
            </div>
            {product.mrp && <div className="text-sm text-gray-500">M.R.P.: <span className="line-through">₹{product.mrp?.toLocaleString()}</span></div>}
            <div className="text-sm text-[#007600]">FREE delivery</div>
          </div>
          <hr className="border-gray-200" />
          <div>
            <h3 className="font-bold text-[#0f1111] mb-2">About this item</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              {product.description?.split('\n').filter(l => l.length > 5).map((line, i) => <li key={i} className="flex gap-2"><Check size={14} className="text-[#007600] mt-0.5 flex-shrink-0" />{line}</li>) || <li>Premium quality.</li>}
            </ul>
          </div>
        </div>

        {/* Right: Buy Box */}
        <div className="lg:col-span-3">
          <div className="border border-gray-200 rounded-lg p-4 space-y-3 sticky top-4">
            <div className="text-2xl font-light">₹ <span className="font-light">{product.price?.toLocaleString()}</span></div>
            <div className="text-sm text-[#007600] font-bold">In stock</div>
            {/* Quantity */}
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Qty:</label>
              <select value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50">
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button
              onClick={handleAddToCart}
              className={`w-full py-2 rounded-full text-sm font-medium transition-all ${ addedToCart ? 'bg-green-500 text-white' : 'bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111]' }`}
            >
              {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full py-2 rounded-full bg-[#ffa41c] hover:bg-[#fa8900] text-[#0f1111] text-sm font-medium transition-all"
            >
              Buy Now
            </button>
            <hr className="border-gray-200" />
            <div className="text-sm space-y-1">
              <div className="flex gap-2"><span className="text-gray-600 w-20">Ships from</span><span className="font-medium">Anritvox</span></div>
              <div className="flex gap-2"><span className="text-gray-600 w-20">Sold by</span><span className="font-medium text-blue-600">Anritvox Store</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
