/* src/pages/ProductDetail.jsx */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, ChevronRight, Check, ShoppingCart, 
  Heart, Share2, Truck, Shield, RefreshCcw, 
  MapPin, Minus, Plus, Zap, Award, Tag
} from 'lucide-react';

import { fetchProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import ReviewSection from '../components/ReviewSection';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23f8fafc'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3ENo Image Available%3C/text%3E%3C/svg%3E";

const ProductSkeleton = () => (
  <div className="max-w-[1600px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[500px_1fr_400px] gap-12 animate-pulse bg-white">
    <div className="space-y-4"><div className="w-full aspect-square bg-slate-100 rounded-[2rem]"></div><div className="flex gap-4 justify-center"><div className="w-20 h-20 bg-slate-100 rounded-2xl"></div><div className="w-20 h-20 bg-slate-100 rounded-2xl"></div><div className="w-20 h-20 bg-slate-100 rounded-2xl"></div></div></div>
    <div className="space-y-6 pt-6"><div className="h-10 bg-slate-100 rounded-xl w-3/4"></div><div className="h-6 bg-slate-100 rounded w-1/4"></div><div className="h-14 bg-slate-100 rounded-xl w-1/3 mt-10"></div><div className="space-y-4 mt-12"><div className="h-5 bg-slate-100 rounded w-full"></div><div className="h-5 bg-slate-100 rounded w-5/6"></div><div className="h-5 bg-slate-100 rounded w-4/6"></div></div></div>
    <div className="w-full h-[600px] bg-slate-50 rounded-[2.5rem] border border-slate-100"></div>
  </div>
);

// Advanced Amazon-Style Precision Zoom
const ImageZoom = ({ src, alt }) => {
  const [position, setPosition] = useState('0% 0%');
  const [showZoom, setShowZoom] = useState(false);
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);

  useEffect(() => { setImgSrc(src || FALLBACK_IMAGE); }, [src]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setPosition(`${x}% ${y}%`);
  };

  return (
    <div
      className="w-full aspect-square relative bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_40px_rgb(0,0,0,0.03)] overflow-hidden cursor-zoom-in group transition-all duration-500 hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)]"
      onMouseEnter={() => setShowZoom(true)}
      onMouseLeave={() => setShowZoom(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={imgSrc}
        alt={alt || "Product"}
        onError={(e) => { setImgSrc(FALLBACK_IMAGE); e.target.onerror = null; }}
        className={`w-full h-full object-contain p-8 transition-opacity duration-200 ${showZoom && imgSrc !== FALLBACK_IMAGE ? 'opacity-0' : 'opacity-100'}`}
      />
      
      {showZoom && imgSrc !== FALLBACK_IMAGE && (
        <div
          className="absolute inset-0 z-10 pointer-events-none bg-white"
          style={{
            backgroundImage: `url("${imgSrc}")`,
            backgroundPosition: position,
            backgroundSize: '250%', // Deep Zoom Level
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs font-bold px-5 py-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 backdrop-blur-md shadow-2xl translate-y-4 group-hover:translate-y-0 z-20 pointer-events-none">
        <Plus size={16} /> Roll over image to zoom in
      </div>
    </div>
  );
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  
  const { addToCart } = useCart();

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        if (!data) throw new Error('Product not found');

        // FIXED: Bulletproof Image Parser ensuring all images load
        let processedImages = [];
        let rawImages = data.images || data.image || [];
        
        // Convert stringified arrays safely before looping
        if (typeof rawImages === 'string') {
          try {
            const parsed = JSON.parse(rawImages);
            rawImages = Array.isArray(parsed) ? parsed : [parsed];
          } catch(e) {
            rawImages = [rawImages];
          }
        } else if (!Array.isArray(rawImages)) {
          rawImages = [rawImages];
        }

        rawImages.forEach(img => {
          if (!img) return;
          let cleanImg = String(img).trim();
          cleanImg = cleanImg.replace(/^(undefined|null)\/?/, '').replace(/^\//, '');
          
          if (cleanImg && !cleanImg.startsWith('http') && !cleanImg.startsWith('data:')) {
            cleanImg = `${BASE_URL.replace(/\/$/, '')}/${cleanImg.startsWith('uploads/') ? '' : 'uploads/'}${cleanImg}`;
          }
          if (cleanImg && !processedImages.includes(cleanImg)) processedImages.push(cleanImg);
        });

        setProduct({ ...data, images: processedImages.length > 0 ? processedImages : [FALLBACK_IMAGE] });
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    getProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const buyBox = document.getElementById('main-buy-box');
      if (buyBox) {
        const rect = buyBox.getBoundingClientRect();
        setShowFloatingBar(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  if (loading) return <ProductSkeleton />;
  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-12 rounded-[2rem] shadow-2xl text-center max-w-lg border border-gray-100">
        <h2 className="text-3xl font-black text-gray-900 mb-4">Product Unavailable</h2>
        <p className="text-gray-500 mb-8 text-lg">{error}</p>
        <Link to="/shop" className="bg-gray-900 text-white font-bold py-4 px-10 rounded-full hover:bg-gray-800 transition-all hover:shadow-lg">Return to Shop</Link>
      </div>
    </div>
  );

  const images = product.images;
  const originalPrice = Number(product.price || 0);
  const sellingPrice = product.discount_price ? Number(product.discount_price) : originalPrice;
  const discountPercentage = product.discount_price && originalPrice > 0 ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
  const descriptionLines = (product.description || '').split('\n').filter(line => line.trim().length > 0);

  return (
    <div className="bg-white min-h-screen pb-32 font-sans antialiased text-gray-900 selection:bg-gray-900 selection:text-white">
      
      {/* Sleek Breadcrumb */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4 text-[13px] font-bold text-gray-400 flex items-center gap-3 uppercase tracking-wider">
          <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-gray-900 transition-colors">Shop</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 truncate max-w-[300px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-[500px_1fr_400px] gap-12 lg:gap-16">
        
        {/* LEFT: Gallery Section */}
        <div className="flex flex-col gap-6">
          <ImageZoom src={images[selectedImage]} alt={product.name} />
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide justify-center px-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onMouseEnter={() => setSelectedImage(idx)}
                onClick={() => setSelectedImage(idx)}
                className={`w-24 h-24 rounded-2xl p-2 flex-shrink-0 transition-all duration-300 bg-white ${
                  selectedImage === idx 
                  ? 'border-2 border-gray-900 shadow-xl scale-105' 
                  : 'border border-gray-100 hover:border-gray-300 opacity-60 hover:opacity-100 hover:shadow-md'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain rounded-xl" onError={(e) => { e.target.src = FALLBACK_IMAGE; e.target.onerror = null; }} />
              </button>
            ))}
          </div>
        </div>

        {/* CENTER: Product Information */}
        <div className="space-y-8">
          
          <div className="space-y-4">
            <Link to="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-black text-sm uppercase tracking-widest transition-colors">
              <Tag size={16} /> {product.brand || 'Premium Collection'}
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-6 pt-2">
              <a href="#reviews-section" className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 px-3 py-1.5 rounded-full transition-colors -ml-3">
                <div className="flex text-amber-400 drop-shadow-sm">
                  {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
                </div>
                <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">Be the first to review</span>
              </a>
              
              <div className="flex gap-3">
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); }} className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all group">
                  <Share2 size={20} className="group-hover:scale-110 transition-transform" />
                </button>
                <button onClick={() => setIsWishlisted(!isWishlisted)} className={`w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center transition-all group ${isWishlisted ? 'border-red-500 bg-red-50' : 'hover:border-red-500 hover:bg-red-50'}`}>
                  <Heart size={20} className={`transition-all duration-300 ${isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-400 group-hover:text-red-500'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Clean Pricing Area */}
          <div className="space-y-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <div className="flex items-end gap-4">
              <div className="flex items-start">
                <span className="text-2xl mt-1.5 font-bold text-gray-900 mr-1">₹</span>
                <span className="text-6xl font-black text-gray-900 tracking-tighter leading-none">{sellingPrice.toLocaleString()}</span>
              </div>
              {discountPercentage > 0 && (
                 <span className="bg-green-100 text-green-700 px-3 py-1 mb-2 rounded-lg text-sm font-black tracking-widest uppercase border border-green-200">Save {discountPercentage}%</span>
              )}
            </div>
            {discountPercentage > 0 && (
              <p className="text-gray-500 font-semibold pt-1">
                M.R.P.: <span className="line-through decoration-gray-400">₹{originalPrice.toLocaleString()}</span>
              </p>
            )}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-2">Taxes included. Free shipping applied.</p>
          </div>

          {/* Futuristic Features Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
            {[
              { icon: <Truck size={22} />, label: "Free Delivery", sub: "All Over India" },
              { icon: <RefreshCcw size={22} />, label: "Easy Returns", sub: "7 Days Policy" },
              { icon: <Shield size={22} />, label: "Warranty", sub: "1 Year Standard" },
              { icon: <Award size={22} />, label: "Authentic", sub: "100% Genuine" }
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-start p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all">
                <div className="text-gray-900 mb-3">{badge.icon}</div>
                <span className="text-sm font-black text-gray-900 leading-tight">{badge.label}</span>
                <span className="text-xs font-semibold text-gray-400 mt-1">{badge.sub}</span>
              </div>
            ))}
          </div>

          {/* Content Tabs */}
          <div className="pt-6">
            <div className="flex gap-10 border-b border-gray-200">
              {['description', 'specifications'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-900 rounded-t-full"></div>}
                </button>
              ))}
            </div>
            
            <div className="py-8">
              {activeTab === 'description' && (
                <div className="space-y-4 text-base font-medium text-gray-600 leading-relaxed">
                  {descriptionLines.length > 0 ? descriptionLines.map((line, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <Check className="text-green-500 mt-1 flex-shrink-0" size={18} />
                      <span className="text-gray-800">{line}</span>
                    </div>
                  )) : <p className="italic text-gray-400">No description provided.</p>}
                </div>
              )}
              {activeTab === 'specifications' && (
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <div className="border-b border-gray-100 pb-2"><div className="font-bold text-gray-400 uppercase tracking-wider text-xs mb-1">Brand</div><div className="font-black text-gray-900">{product.brand || 'Anritvox'}</div></div>
                    <div className="border-b border-gray-100 pb-2"><div className="font-bold text-gray-400 uppercase tracking-wider text-xs mb-1">Model Name</div><div className="font-black text-gray-900">{product.name?.split(' ')[0] || 'Premium'}</div></div>
                    <div className="border-b border-gray-100 pb-2"><div className="font-bold text-gray-400 uppercase tracking-wider text-xs mb-1">Category</div><div className="font-black text-gray-900 capitalize">{product.category || 'Accessories'}</div></div>
                    <div className="border-b border-gray-100 pb-2"><div className="font-bold text-gray-400 uppercase tracking-wider text-xs mb-1">Item Weight</div><div className="font-black text-gray-900">Standard</div></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Advanced Sticky Action Panel */}
        <div className="relative z-10">
          <div id="main-buy-box" className="sticky top-28 bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgb(0,0,0,0.06)] flex flex-col gap-8">
            
            {/* Live Stock Pulse */}
            <div className="flex items-center gap-4 bg-green-50 border border-green-100 p-5 rounded-3xl">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
              </span>
              <div>
                <p className="text-base text-green-800 font-black tracking-tight leading-none mb-1">In Stock & Ready</p>
                {product.quantity < 10 && <p className="text-xs text-red-600 font-bold uppercase tracking-wider mt-2 bg-red-100 inline-block px-2 py-1 rounded-md">Hurry, only {product.quantity} left!</p>}
              </div>
            </div>

            {/* Smart Delivery Predictor */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-white">
                <Zap size={24} className="text-amber-400 flex-shrink-0" fill="currentColor" />
                <div>
                  <div className="font-black text-gray-900">Fastest Delivery</div>
                  <div className="text-sm font-medium text-gray-500 mt-1">Order within <span className="font-bold text-gray-900">2 hrs 40 mins</span> for dispatch today.</div>
                </div>
              </div>
              <button className="flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-800 transition-colors w-full p-3 rounded-xl hover:bg-blue-50">
                <MapPin size={18} /> Update delivery pin code
              </button>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Select Quantity</label>
              <div className="flex items-center w-full border border-gray-200 rounded-2xl overflow-hidden bg-white h-16 shadow-sm">
                <button onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} className="px-6 h-full hover:bg-gray-50 text-gray-900 transition-colors border-r border-gray-100 font-bold"><Minus size={20}/></button>
                <div className="flex-1 text-center font-black text-gray-900 text-xl">{quantity}</div>
                <button onClick={() => setQuantity(q => q < 10 ? q + 1 : 10)} className="px-6 h-full hover:bg-gray-50 text-gray-900 transition-colors border-l border-gray-100 font-bold"><Plus size={20}/></button>
              </div>
            </div>

            {/* Giant Buy Buttons */}
            <div className="space-y-4 pt-2">
              <button onClick={handleAddToCart} disabled={product.quantity <= 0} className={`w-full h-16 rounded-2xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-3 ${product.quantity <= 0 ? 'bg-gray-100 text-gray-400' : addedToCart ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-gray-900 hover:bg-gray-800 text-white shadow-xl shadow-gray-900/20 active:scale-[0.98]'}`}>
                {addedToCart ? <><Check size={24} /> Added to Cart</> : <><ShoppingCart size={22} /> Add to Cart</>}
              </button>
              
              <button onClick={handleBuyNow} disabled={product.quantity <= 0} className={`w-full h-16 rounded-2xl font-black text-lg transition-all duration-300 active:scale-[0.98] ${product.quantity <= 0 ? 'bg-gray-100 text-gray-400' : 'bg-amber-400 hover:bg-amber-500 text-gray-900 shadow-xl shadow-amber-400/20'}`}>
                Buy It Now
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pt-2">
              <Shield size={16} /> Secure 256-bit Checkout
            </div>
          </div>
        </div>
      </div>

      {/* RENDER THE REVIEWS SECTION */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-16 border-t border-gray-100">
         <ReviewSection productId={id} />
      </div>

      {/* Ultra-Modern Glassmorphism Floating Bar */}
      <div className={`fixed bottom-0 left-0 w-full z-50 transform transition-transform duration-500 ease-out ${showFloatingBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-white/70 backdrop-blur-2xl border-t border-white/50 shadow-[0_-20px_40px_rgb(0,0,0,0.05)] py-4 px-6 md:px-12 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
               <img src={images[0]} alt="Product" className="w-full h-full object-contain" onError={(e) => { e.target.src = FALLBACK_IMAGE; e.target.onerror = null; }} />
            </div>
            <div>
              <div className="font-black text-gray-900 text-lg truncate max-w-[300px]">{product.name}</div>
              <div className="font-black text-gray-500 text-sm">₹{sellingPrice.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
             <button onClick={handleAddToCart} className="flex-1 md:w-56 h-14 rounded-xl bg-gray-900 text-white font-black flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
               {addedToCart ? <Check size={20} /> : <ShoppingCart size={20} />} Add to Cart
             </button>
             <button onClick={handleBuyNow} className="flex-1 md:w-56 h-14 rounded-xl bg-amber-400 hover:bg-amber-500 text-gray-900 font-black transition-colors">Buy Now</button>
          </div>
        </div>
      </div>

    </div>
  );
}
